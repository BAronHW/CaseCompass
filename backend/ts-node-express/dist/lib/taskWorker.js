"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTaskWorker = void 0;
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
const taskSwtichStatement_js_1 = require("../functions/taskSwtichStatement.js");
const redisConnectionContext_js_1 = require("./redisConnectionContext.js");
const models_js_1 = require("../models/models.js");
dotenv_1.default.config();
const uploadDocumentTaskWorker = new bullmq_1.Worker('documentTasks', async (job) => {
    const backgroundTaskResult = await (0, taskSwtichStatement_js_1.jobSwitchStatement)(job);
    return backgroundTaskResult;
}, {
    connection: redisConnectionContext_js_1.redisConnection,
    concurrency: 5,
});
uploadDocumentTaskWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
uploadDocumentTaskWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`);
});
// <-------------------------------Chunk Docs----------------------------------->
const ChunkDocumentTaskWorker = new bullmq_1.Worker('chunkDocumentTask', async (job) => {
    const backgroundTaskResult = await (0, taskSwtichStatement_js_1.jobSwitchStatement)(job);
    return backgroundTaskResult;
}, {
    connection: redisConnectionContext_js_1.redisConnection,
    concurrency: 5,
});
ChunkDocumentTaskWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
ChunkDocumentTaskWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`);
});
// <--------------------------------Chunk to Embeddings------------------------------>
const ChunkToEmbeddingsWorker = new bullmq_1.Worker('chunkToEmbeddingsTask', async (job) => {
    const backgroundTaskResult = await (0, taskSwtichStatement_js_1.jobSwitchStatement)(job);
    return backgroundTaskResult;
}, {
    connection: redisConnectionContext_js_1.redisConnection,
    concurrency: 5,
});
ChunkToEmbeddingsWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
ChunkToEmbeddingsWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`);
});
const DeleteDocumentTaskWorker = new bullmq_1.Worker('chunkToEmbeddingsTask', async (job) => {
    const backgroundTaskResult = await (0, taskSwtichStatement_js_1.jobSwitchStatement)(job);
    return backgroundTaskResult;
}, {
    connection: redisConnectionContext_js_1.redisConnection,
    concurrency: 5,
});
ChunkToEmbeddingsWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
ChunkToEmbeddingsWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`);
});
const startTaskWorker = (typeOfTask) => {
    switch (typeOfTask) {
        case models_js_1.TypeOfTask.DocumentUpload:
            return uploadDocumentTaskWorker;
            break;
        case models_js_1.TypeOfTask.ChunkDocument:
            return ChunkDocumentTaskWorker;
            break;
        case models_js_1.TypeOfTask.ConvertChunkToEmbedding:
            return ChunkDocumentTaskWorker;
            break;
        case models_js_1.TypeOfTask.DeleteDocument:
            return DeleteDocumentTaskWorker;
        default:
            throw new Error('startTaskWorker Error didnt match any type of task supported');
    }
};
exports.startTaskWorker = startTaskWorker;
