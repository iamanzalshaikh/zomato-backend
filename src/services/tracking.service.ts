import redisClient from "../config/redis.js";
import config from "../config/config.js";
import logger from "../config/logger.js";

const PREFIX = "live:rider:";

export interface LiveRiderLocation {
  orderId: string;
  riderId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  updatedAt: number;
}

function key(orderId: string) {
  return `${PREFIX}${orderId}`;
}

export async function setLiveRiderLocation(input: {
  orderId: string;
  riderId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}): Promise<void> {
  if (!redisClient.isOpen) return;

  const payload: LiveRiderLocation = {
    orderId: input.orderId,
    riderId: input.riderId,
    latitude: input.latitude,
    longitude: input.longitude,
    speed: input.speed,
    heading: input.heading,
    updatedAt: Date.now(),
  };

  try {
    await redisClient.setEx(
      key(input.orderId),
      config.LIVE_LOCATION_TTL_SECONDS,
      JSON.stringify(payload),
    );
  } catch (error) {
    logger.warn("Failed to set live rider location", { error, orderId: input.orderId });
  }
}

export async function getLiveRiderLocation(
  orderId: string,
): Promise<LiveRiderLocation | null> {
  if (!redisClient.isOpen) return null;
  try {
    const raw = await redisClient.get(key(orderId));
    if (!raw) return null;
    return JSON.parse(raw) as LiveRiderLocation;
  } catch (error) {
    logger.warn("Failed to get live rider location", { error, orderId });
    return null;
  }
}

export async function clearLiveRiderLocation(orderId: string): Promise<void> {
  if (!redisClient.isOpen) return;
  try {
    await redisClient.del(key(orderId));
  } catch (error) {
    logger.warn("Failed to clear live rider location", { error, orderId });
  }
}
