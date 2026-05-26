import { QUEUE_NAMES } from "../config/bullmq.js";
import { addQueueJob } from "./queue.factory.js";

export type AnalyticsJobType = "warm_cache" | "invalidate_restaurants";

export interface AnalyticsJobPayload {
  type: AnalyticsJobType;
}

export async function enqueueAnalyticsJob(payload: AnalyticsJobPayload) {
  const { warmAnalyticsCache, invalidateRestaurantCaches } = await import(
    "../services/analytics-cache.service.js"
  );

  return addQueueJob(QUEUE_NAMES.ANALYTICS, payload.type, payload, async () => {
    if (payload.type === "warm_cache") {
      await warmAnalyticsCache();
    } else {
      await invalidateRestaurantCaches();
    }
  });
}
