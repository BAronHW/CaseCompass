import { PutObjectCommand } from "@aws-sdk/client-s3";
import * as crypto from 'crypto';
import { s3 } from "../lib/s3Context.js";
import { db } from "../lib/prismaContext.js";
import { ChunkPDF } from "./chunkPDF.js";
import { GeminiAiContext } from "../lib/GeminiAiContext.js";
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

export const uploadToS3 = async (jobData: UploadToS3JobData): Promise<UploadToS3Result> => {
    try {
        if (!jobData.file || !jobData.uid) {
            throw new Error('Missing required fields: file and uid are required');
        }

        const buffer = Buffer.from(jobData.file, 'base64');
        
        const uniqueName = crypto.randomBytes(32).toString('hex');
        
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: uniqueName,
            Body: buffer,
            ContentType: "application/pdf",
        };
        
        const command = new PutObjectCommand(params);
        const sentDocument = await s3.send(command);
        console.log("tstesdftesg", sentDocument)

        
        const uploadedDocument = await db.document.create({
            data: {
                key: uniqueName,
                title: jobData.name,
                size: jobData.size,
                uid: jobData.uid,
            }
        });

        if(sentDocument.$metadata.httpStatusCode !== 200){
            throw new Error('unable to send to s3');
        }

        const arrayOfChunkedDocs = await ChunkPDF(buffer);

        const gemini = new GoogleGenAI({
            apiKey: process.env.GEMINI_KEY,
        })

        const arrayOfEmbeddings = Promise.all(
            await arrayOfChunkedDocs.map( async (chunk)=>{
                return await gemini.models.embedContent({
                    model: 'gemini-embedding-exp-03-07',
                    contents: chunk.pageContent,
                    config: {
                        taskType: "SEMANTIC_SIMILARITY",
                    }
                })
            })
        );

        console.log(arrayOfEmbeddings);

        // may have to write the SQL by hand since I dont think prisma can handle the raw vector.

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