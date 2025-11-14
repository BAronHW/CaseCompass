import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import * as crypto from 'crypto';
import { s3 } from "../lib/s3Context.js";
import { db } from "../lib/prismaContext.js";
import { ChunkPDF } from "./chunkPDF.js";
import { GoogleGenAI } from "@google/genai";
import { getPreSignedUrl } from "../lib/getPreSignedUrl.js";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync, writeFileSync } from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

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

export const uploadToS3 = async (jobData: UploadToS3JobData): Promise<UploadToS3Result> => {

    const tempFilePath = join(tmpdir(), `temp_pdf_${Date.now()}.pdf`);
    
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

        writeFileSync(tempFilePath, buffer);

        const loader = new PDFLoader(tempFilePath, {
            splitPages: true,
        });
        const docs = await loader.load();
        const pdfContent = docs.map((doc) => doc.pageContent);
        const pdfContentString = pdfContent.join("");
        const arrayOfChunkedDocs = await ChunkPDF(docs);

        const uploadedDocument = await db.document.create({
            data: {
                key: uniqueName,
                title: jobData.name,
                size: jobData.size,
                uid: jobData.uid,
                url: objectUrl,
                content: pdfContentString
            }
        });

        if(sentDocument.$metadata.httpStatusCode !== 200){
            throw new Error('unable to send to s3');
        }

        

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

        await Promise.all(
            arrayOfEmbeddingsAndAssociatedChunks
                .filter(embedding => embedding !== null)
                .map(async(embedding) => {
                    const embeddingText = embedding.text_chunk;
                    const embeddingValues = embedding.embedding![0].values;
                    try {
                        await db.$executeRaw`
                            INSERT INTO "documentChunks" (content, "documentId", embeddings)
                            VALUES (${embeddingText}, ${uploadedDocument.id}, ${embeddingValues}::vector)
                        `;  
                    } catch(error) {
                        throw error;
                    }     
                })
            );


        return {
            key: uniqueName,
            name: jobData.name,
            size: jobData.size,
            uid: jobData.uid,
        };
    } catch (error) {
        console.error('Error in uploadToS3:', error);
        throw error;
    } finally {

        if (tempFilePath) {
            try {
                unlinkSync(tempFilePath);
            } catch (unlinkError) {
                console.warn('Warning: Could not delete temp file:', unlinkError);
            }
        }

    }
}