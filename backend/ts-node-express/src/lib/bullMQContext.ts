import { Queue } from 'bullmq';
import { redisConnection } from './redisConnectionContext.js';

export const jobQueue = new Queue('documentTasks', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});



