import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { jobSwitchStatement } from '../functions/taskSwtichStatement';
dotenv.config();

const redisConnection = {
    host: 'localhost',
    port: 6379,
};

export const myWorker = new Worker('tasks', async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    const backgroundTaskResult = await jobSwitchStatement(job.data);

    return backgroundTaskResult

}, {
    connection: redisConnection,
  });