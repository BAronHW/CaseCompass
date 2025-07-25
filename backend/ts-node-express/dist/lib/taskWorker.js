import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { jobSwitchStatement } from '../functions/taskSwtichStatement.js';
import { redisConnection } from './redisConnectionContext.js';
import { TypeOfTask } from '../models/models.js';
dotenv.config();
const uploadDocumentTaskWorker = new Worker('documentTasks', async (job) => {
    const backgroundTaskResult = await jobSwitchStatement(job);
    return backgroundTaskResult;
}, {
    connection: redisConnection,
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
const ChunkDocumentTaskWorker = new Worker('chunkDocumentTask', async (job) => {
    const backgroundTaskResult = await jobSwitchStatement(job);
    return backgroundTaskResult;
}, {
    connection: redisConnection,
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
const ChunkToEmbeddingsWorker = new Worker('chunkToEmbeddingsTask', async (job) => {
    const backgroundTaskResult = await jobSwitchStatement(job);
    return backgroundTaskResult;
}, {
    connection: redisConnection,
    concurrency: 5,
});
ChunkToEmbeddingsWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
ChunkToEmbeddingsWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`);
});
const DeleteDocumentTaskWorker = new Worker('chunkToEmbeddingsTask', async (job) => {
    const backgroundTaskResult = await jobSwitchStatement(job);
    return backgroundTaskResult;
}, {
    connection: redisConnection,
    concurrency: 5,
});
ChunkToEmbeddingsWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
ChunkToEmbeddingsWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`);
});
export const startTaskWorker = (typeOfTask) => {
    switch (typeOfTask) {
        case TypeOfTask.DocumentUpload:
            return uploadDocumentTaskWorker;
            break;
        case TypeOfTask.ChunkDocument:
            return ChunkDocumentTaskWorker;
            break;
        case TypeOfTask.ConvertChunkToEmbedding:
            return ChunkDocumentTaskWorker;
            break;
        case TypeOfTask.DeleteDocument:
            return DeleteDocumentTaskWorker;
        default:
            throw new Error('startTaskWorker Error didnt match any type of task supported');
    }
};
