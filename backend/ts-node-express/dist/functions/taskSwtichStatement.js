"use strict";
/**
 * This function takes a bullmq job and based on the job name will forward job data from the worker node
 * to its respective function
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSwitchStatement = void 0;
const analyzePDF_js_1 = require("./analyzePDF.js");
const uploadToS3_js_1 = require("./uploadToS3.js");
const categorizePDF_js_1 = require("./categorizePDF.js");
const deletePDF_js_1 = require("./deletePDF.js");
const jobSwitchStatement = async (job) => {
    switch (job.name) {
        case 'analyzePDF':
            return await (0, analyzePDF_js_1.analyzePDF)(job.data);
        case 'uploadDocumentToS3':
            return await (0, uploadToS3_js_1.uploadToS3)(job.data);
        case 'categorizePDF':
            return await (0, categorizePDF_js_1.categorizePDF)(job.data);
        case 'deleteDocument':
            return await (0, deletePDF_js_1.deletePdf)(job.data);
        default:
            throw new Error(`Unknown job type: ${job.name}`);
    }
};
exports.jobSwitchStatement = jobSwitchStatement;
