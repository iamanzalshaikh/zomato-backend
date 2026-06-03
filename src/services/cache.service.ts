import { createHash } from "crypto";
import redisClient from "../config/redis.js";
import config from "../config/config.js";
import logger from "../config/logger.js";

const PREFIX = "cache:";

export const CacheKeys = {
  restaurantList: (hash: string) => `${PREFIX}restaurants:list:${hash}`,
  restaurantSearch: (q: string, page: number, limit: number) =>
    `${PREFIX}restaurants:search:${q}:${page}:${limit}`,
  nearbyRestaurants: (lat: number, lng: number, radiusKm: number, page: number, limit: number) =>
    `${PREFIX}restaurants:nearby:${lat.toFixed(4)}:${lng.toFixed(4)}:${radiusKm}:${page}:${limit}`,
  menuItems: (restaurantId: string) => `${PREFIX}menu:${restaurantId}`,
  recommendedRestaurants: () => `${PREFIX}restaurants:recommended`,
  trendingSearches: () => `${PREFIX}search:trending`,
} as const;

export function hashQuery(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return createHash("md5").update(JSON.stringify(sorted)).digest("hex").slice(0, 16);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisClient.isOpen) return null;
  try {
    const raw = await redisClient.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn("Cache get failed", { key, error });
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = config.CACHE_TTL_SECONDS,
): Promise<void> {
  if (!redisClient.isOpen) return;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn("Cache set failed", { key, error });
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!redisClient.isOpen) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.warn("Cache del failed", { key, error });
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn("Cache pattern delete failed", { pattern, error });
  }
}

/** Read-through cache: returns cached value or runs loader and stores result. */
export async function cacheGetOrSet<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds = config.CACHE_TTL_SECONDS,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const value = await loader();
  void cacheSet(key, value, ttlSeconds);
  return value;
}

export async function invalidateRestaurantCaches(): Promise<void> {
  await cacheDelPattern(`${PREFIX}restaurants:*`);
}

export async function invalidateMenuCache(restaurantId: string): Promise<void> {
  await cacheDel(CacheKeys.menuItems(restaurantId));
}
