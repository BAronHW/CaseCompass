import { Queue } from 'bullmq';
import { redisConnection } from './redisConnectionContext';

const myQueue = new Queue('task', {
  connection: redisConnection,
});

const addJob = async () => {
  const job = await myQueue.add('s3Object', {
    file: "sfdasfasfadsfasfadsf",
    name: "test",
    size: 128,
    uid: "19da49a4-12d7-4372-a175-9f1211e43134"
  })
}


