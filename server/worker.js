import { Worker } from 'bullmq';

const worker = new Worker('file-upload', async (job) => {
  console.log(`Processing job ${job.id} with data:`, job.data);
}, { concurrency: 100, connection: { host: 'localhost', port: 6379 } });