import { QUEUE_NAMES } from "../config/bullmq.js";
import { addQueueJob } from "./queue.factory.js";

export interface RefundJobPayload {
  userId: string;
  paymentId: string;
  reason?: string;
  amount?: number;
}

export async function enqueueRefundJob(payload: RefundJobPayload) {
  const { initiateRefund } = await import("../services/payment.service.js");
  return addQueueJob(
    QUEUE_NAMES.REFUNDS,
    "process",
    payload,
    async () => {
      await initiateRefund(
        payload.userId,
        payload.paymentId,
        payload.reason,
        payload.amount,
      );
    },
  );
}
