import { Queue, Worker, type JobsOptions } from "bullmq";
import redisClient from "../config/redis.js";
import logger from "../config/logger.js";
import { getBullMqConnection, isBullMqEnabled, type QueueName } from "../config/bullmq.js";

const queues = new Map<QueueName, Queue>();
const workers: Worker[] = [];

export function getQueue(name: QueueName): Queue | null {
  if (!isBullMqEnabled() || !redisClient.isOpen) return null;

  let queue = queues.get(name);
  if (!queue) {
    queue = new Queue(name, { connection: getBullMqConnection() });
    queues.set(name, queue);
  }
  return queue;
}

export async function addQueueJob<T>(
  queueName: QueueName,
  jobName: string,
  data: T,
  inline: () => Promise<void>,
  options?: JobsOptions,
): Promise<{ queued: boolean; jobId?: string }> {
  const queue = getQueue(queueName);
  if (!queue) {
    await inline();
    return { queued: false };
  }

  try {
    const job = await queue.add(jobName, data, {
      removeOnComplete: 200,
      removeOnFail: 100,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      ...options,
    });
    return { queued: true, jobId: job.id };
  } catch (error) {
    logger.error(`Enqueue failed on ${queueName}, running inline`, { error });
    await inline();
    return { queued: false };
  }
}

export function registerWorker<T>(
  queueName: QueueName,
  processor: (data: T) => Promise<void>,
  concurrency = 3,
): void {
  if (!isBullMqEnabled()) return;

  const worker = new Worker(
    queueName,
    async (job) => {
      await processor(job.data as T);
    },
    { connection: getBullMqConnection(), concurrency },
  );

  worker.on("failed", (job, err) => {
    logger.error(`BullMQ job failed`, {
      queue: queueName,
      jobId: job?.id,
      err: err.message,
    });
  });

  workers.push(worker);
}

export async function getAllQueueStats(): Promise<Record<string, unknown>> {
  const stats: Record<string, unknown> = { enabled: isBullMqEnabled() };
  for (const [name, queue] of queues) {
    stats[name] = await queue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    );
  }
  return stats;
}

export async function closeQueues(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  await Promise.all([...queues.values()].map((q) => q.close()));
  workers.length = 0;
  queues.clear();
}
