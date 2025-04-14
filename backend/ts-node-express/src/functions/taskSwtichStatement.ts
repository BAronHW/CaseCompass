/**
 * This function takes a bullmq job and based on the job name will forward job data from the worker node
 * to its respective function
 */

import { Job } from "bullmq";
import { analyzePDF } from "./analyzePDF";
import { uploadToS3 } from "./uploadToS3";
import { categorizePDF } from "./categorizePDF";

export const jobSwitchStatement = async (job: Job) => {
    switch(job.name){
        case 'analyzePDF':
            return await analyzePDF(job.data);
        case 'uploadDocumentToS3':
            return await uploadToS3(job.data);
        case 'categorizePDF':
            return await categorizePDF(job.data);
        default:
            throw new Error(`Unknown job type: ${job.name}`);
    }
}