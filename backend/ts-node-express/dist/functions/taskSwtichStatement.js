/**
 * This function takes a bullmq job and based on the job name will forward job data from the worker node
 * to its respective function
 */
import { analyzePDF } from "./analyzePDF.js";
import { uploadToS3 } from "./uploadToS3.js";
import { categorizePDF } from "./categorizePDF.js";
import { deletePdf } from './deletePDF.js';
export const jobSwitchStatement = async (job) => {
    switch (job.name) {
        case 'analyzePDF':
            return await analyzePDF(job.data);
        case 'uploadDocumentToS3':
            return await uploadToS3(job.data);
        case 'categorizePDF':
            return await categorizePDF(job.data);
        case 'deleteDocument':
            return await deletePdf(job.data);
        default:
            throw new Error(`Unknown job type: ${job.name}`);
    }
};
