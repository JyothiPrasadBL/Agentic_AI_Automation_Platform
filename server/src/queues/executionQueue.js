const { redisUrl } = require('../config/env');
let queue; let worker; let redisConnection; const memoryJobs = new Map();

function mode() { return redisUrl ? 'bullmq' : 'memory'; }
async function enqueue(executionId, handler, delay = 0) {
  if (!redisUrl) { memoryJobs.set(executionId, { executionId, handler }); setTimeout(async () => { const job = memoryJobs.get(executionId); memoryJobs.delete(executionId); if (job) await job.handler(job.executionId); }, delay); return { mode: 'memory', id: executionId }; }
  const { Queue, Worker } = require('bullmq'); const IORedis = require('ioredis');
  if (!redisConnection) redisConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  if (!queue) queue = new Queue('workflow-executions', { connection: redisConnection });
  if (!worker) worker = new Worker('workflow-executions', async (job) => { const registered = memoryJobs.get(job.data.executionId); if (registered) { memoryJobs.delete(job.data.executionId); return registered.handler(job.data.executionId); } }, { connection: redisConnection });
  memoryJobs.set(executionId, { executionId, handler }); await queue.add('execute', { executionId }, { jobId: executionId, delay, removeOnComplete: true, removeOnFail: 100 }); return { mode: 'bullmq', id: executionId };
}
module.exports = { enqueue, mode };
