import { Job, Worker } from 'bullmq';
import dotenv from 'dotenv';
import { jobSwitchStatement } from '../functions/taskSwtichStatement';
import { redisConnection } from './redisConnectionContext';
dotenv.config();

export const taskWorker = new Worker('tasks', async (job : Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    const backgroundTaskResult = await jobSwitchStatement(job.data);

    return backgroundTaskResult

}, {
    connection: redisConnection,
    concurrency: 5,
});

taskWorker.run();
taskWorker.on('completed', job => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});

taskWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error:`, err.message);
});


