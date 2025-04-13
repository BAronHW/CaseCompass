import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { jobSwitchStatement } from '../functions/taskSwtichStatement';
import { redisConnection } from './redisConnectionContext';
dotenv.config();

export const myWorker = new Worker('tasks', async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    const backgroundTaskResult = await jobSwitchStatement(job.data);

    return backgroundTaskResult

}, {
    connection: redisConnection,
  });