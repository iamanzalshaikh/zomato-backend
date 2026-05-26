import {
  listRestaurants,
  searchRestaurants,
  nearbyRestaurants,
} from "./restaurant.service.js";
import { invalidateRestaurantCaches } from "./cache.service.js";
import logger from "../config/logger.js";

export { invalidateRestaurantCaches };

/** Pre-warm common read paths for faster discovery APIs. */
export async function warmAnalyticsCache(): Promise<void> {
  logger.info("Warming restaurant discovery cache");
  await listRestaurants({ page: 1, limit: 20, sort: "distance", lat: 12.9716, lng: 77.5946 });
  await searchRestaurants("food", 1, 10);
  await nearbyRestaurants(12.9716, 77.5946, 5, 1, 10);
}
