import { Job, Worker } from 'bullmq';
import dotenv from 'dotenv';
import { jobSwitchStatement } from '../functions/taskSwtichStatement';
import { redisConnection } from './redisConnectionContext';
dotenv.config();

const taskWorker = new Worker('documentTasks', async (job : Job) => {

    const backgroundTaskResult = await jobSwitchStatement(job);

    return backgroundTaskResult

}, {
    connection: redisConnection,
    concurrency: 5,
});

taskWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});

taskWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
    console.log(`Job ${job?.name}`)
});

export const startTaskWorker = () => {
    return taskWorker;
}


