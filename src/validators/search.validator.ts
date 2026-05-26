import { z } from "zod";

const baseSearch = {
  q: z.string().min(1).max(100),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

export const globalSearchSchema = z.object({
  ...baseSearch,
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.5).max(50).optional(),
});

export const restaurantSearchSchema = z.object({
  ...baseSearch,
});

export const foodSearchSchema = z.object({
  ...baseSearch,
  restaurantId: z.string().optional(),
  foodType: z.enum(["veg", "nonveg", "egg"]).optional(),
});

export const trendingSearchSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
