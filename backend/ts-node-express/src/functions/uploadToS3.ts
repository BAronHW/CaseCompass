import { PutObjectCommand } from "@aws-sdk/client-s3";
import { JobData } from "bullmq";
import * as crypto from 'crypto';
import { s3 } from "../lib/s3Context";
import { db } from "../lib/prismaContext";

export interface uploadToS3JobData {
    key: string,
    name: string
    size: number,
    uid: string,
}

export const uploadToS3 = async (jobData : JobData) : Promise<uploadToS3JobData> => {
    /**
     * this function should take the job data object then turn it into an object and write into an s3 bucket
     * if successfully uploaded write into db
     * model Document {
        key         String
        size        Int
        name        String?
        user        User          @relation(fields: [uid], references: [uid])
        uid         String
        accountTemplate accountTemplate[]
        documentComments documentComments[]
        }
     * */
    const buffer = Buffer.from(jobData.file, 'base64');
    const randomName = (bytes = 32) => {
        return crypto.randomBytes(bytes).toString('hex')
    }
    const uniqueName = randomName()
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: uniqueName,
        Body: buffer,
        ContentType: "PDF",
    }
    const command = new PutObjectCommand(params)
    const result = await s3.send(command);
    console.log(result);

    const uploadDocument = await db.document.create({
        data:{
            key: uniqueName,
            name:  jobData.name,
            size: jobData.size,
            uid: jobData.uid,
        }
    })

    return uploadDocument;

}