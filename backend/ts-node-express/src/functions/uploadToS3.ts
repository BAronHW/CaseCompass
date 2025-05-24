import { PutObjectCommand } from "@aws-sdk/client-s3";
import { JobData } from "bullmq";
import * as crypto from 'crypto';
import { s3 } from "../lib/s3Context";
import { db } from "../lib/prismaContext";
import { ChunkPDF } from "./chunkPDF";
import { OpenAIFunctions } from "../lib/OpenAIContext";

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

        
        await db.document.create({
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

        const openai = new OpenAIFunctions();

        const chunkEmbeddings = Promise.all(
            await arrayOfChunkedDocs.map((chunk)=>{
                openai.getEmbeddings(chunk.pageContent)
            })
        );

        console.log(chunkEmbeddings);

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