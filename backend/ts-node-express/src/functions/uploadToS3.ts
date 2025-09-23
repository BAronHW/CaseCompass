import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as crypto from 'crypto';
import { s3 } from "../lib/s3Context.js";
import { db } from "../lib/prismaContext.js";
import { ChunkPDF } from "./chunkPDF.js";
import { GoogleGenAI } from "@google/genai";


export interface UploadToS3JobData {
    file: string;
    name: string;
    size: number;
    uid: string;
}

export interface UploadToS3Result {
    key: string;
    name: string;
    size: number;
    uid: string;
}

const getPreSignedUrl = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key
    })

    const preSignedUrl = await getSignedUrl(s3,command, {
        expiresIn: 3600
    });

    return preSignedUrl
}

export const uploadToS3 = async (jobData: UploadToS3JobData): Promise<UploadToS3Result> => {
    try {
        if (!jobData.file || !jobData.uid) {
            throw new Error('Missing required fields: file and uid are required');
        }

        const buffer = Buffer.from(jobData.file, 'base64');
        
        const uniqueName = crypto.randomBytes(32).toString('hex');
        
        const bucketName = process.env.BUCKET_NAME;

        const params = {
            Bucket: bucketName,
            Key: uniqueName,
            Body: buffer,
            ContentType: "application/pdf",
        };
        
        const command = new PutObjectCommand(params);
        const sentDocument = await s3.send(command);
        
        const objectUrl = await getPreSignedUrl(uniqueName);

        const uploadedDocument = await db.document.create({
            data: {
                key: uniqueName,
                title: jobData.name,
                size: jobData.size,
                uid: jobData.uid,
                url: objectUrl
            }
        });

        if(sentDocument.$metadata.httpStatusCode !== 200){
            throw new Error('unable to send to s3');
        }

        const arrayOfChunkedDocs = await ChunkPDF(buffer);

        const gemini = new GoogleGenAI({
            apiKey: process.env.GEMINI_KEY!,
        })

        const arrayOfEmbeddingsAndAssociatedChunks = await Promise.all(
            arrayOfChunkedDocs.map(async (chunk, index) => {
            try {
                const result = await gemini.models.embedContent({
                    model: 'text-embedding-004',
                    contents: [{
                        parts: [{ text: chunk.pageContent }]
                    }],
                    config: {
                        taskType: "SEMANTIC_SIMILARITY",
                    }
                });
                return {
                    text_chunk: chunk.pageContent,
                    embedding: result.embeddings
                }
                
            } catch (error) {
                console.error(`Error generating embedding for chunk ${index}:`, error);
                return null;
            }
            })
        );

        arrayOfEmbeddingsAndAssociatedChunks.map(async(embedding)=>{
            const embeddingText = embedding!.text_chunk;
            const embeddingValues = embedding!.embedding![0].values;
            try{
                await db.$executeRaw`
                    INSERT INTO "documentChunks" (content, "documentId", embeddings)
                    VALUES (${embeddingText}, ${uploadedDocument.id}, ${embeddingValues}::vector)
                `;  
            }catch(error){
                console.log(error)
            }     
        })


        return {
            key: uniqueName,
            name: jobData.name,
            size: jobData.size,
            uid: jobData.uid,
        };
    } catch (error) {
        console.error('Error in uploadToS3:', error);
        throw error;
    }
}