import { Queue } from 'bullmq';
import { redisConnection } from './redisConnectionContext';

const myQueue = new Queue('task', {
  connection: redisConnection,
});

