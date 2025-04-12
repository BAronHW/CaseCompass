import { S3Client } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const s3AccessKey = process.env.S3_ACCESS_KEY
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY

export const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretAccessKey
    }
})