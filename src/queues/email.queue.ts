import { QUEUE_NAMES } from "../config/bullmq.js";
import { addQueueJob } from "./queue.factory.js";

export interface EmailJobPayload {
  to: string;
  subject: string;
  html: string;
}

export async function enqueueEmailJob(payload: EmailJobPayload): Promise<void> {
  const { sendTransactionalEmail } = await import("../config/mail.js");
  await addQueueJob(
    QUEUE_NAMES.EMAILS,
    "send",
    payload,
    async () => {
      await sendTransactionalEmail(payload.to, payload.subject, payload.html);
    },
  );
}
