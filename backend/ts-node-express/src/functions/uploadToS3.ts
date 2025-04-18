import { JobData } from "bullmq";

export const uploadToS3 = async (jobData : JobData) : Promise<void> => {
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
     * 
     * 
     * */
}