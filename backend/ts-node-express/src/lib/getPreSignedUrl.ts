import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3Context.js";
import * as dotenv from 'dotenv';

dotenv.config()
export const getPreSignedUrl = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key
    })

    const preSignedUrl = await getSignedUrl(s3,command, {
        expiresIn: 3600
    });

    return preSignedUrl
}