import { Queue } from 'bullmq';
import { redisConnection } from './redisConnectionContext';

export const jobQueue = new Queue('task', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});



