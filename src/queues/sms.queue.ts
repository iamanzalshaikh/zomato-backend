import { QUEUE_NAMES } from "../config/bullmq.js";
import { addQueueJob } from "./queue.factory.js";
import logger from "../config/logger.js";

export interface SmsJobPayload {
  mobile: string;
  message: string;
}

export async function enqueueSmsJob(payload: SmsJobPayload): Promise<void> {
  await addQueueJob(QUEUE_NAMES.SMS, "send", payload, async () => {
    logger.info(`[SMS stub] to=${payload.mobile} message=${payload.message}`);
  });
}
