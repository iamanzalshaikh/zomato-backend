import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
  restaurantRating: z.coerce.number().int().min(1).max(5).optional(),
  deliveryRating: z.coerce.number().int().min(1).max(5).optional(),
  foodRating: z.coerce.number().int().min(1).max(5).optional(),
  reviewText: z.string().trim().max(1000).optional(),
  images: z.array(z.string().trim().min(1)).max(10).optional(),
});

export const updateReviewSchema = z.object({
  restaurantRating: z.coerce.number().int().min(1).max(5).optional(),
  deliveryRating: z.coerce.number().int().min(1).max(5).optional(),
  foodRating: z.coerce.number().int().min(1).max(5).optional(),
  reviewText: z.string().trim().max(1000).optional(),
  images: z.array(z.string().trim().min(1)).max(10).optional(),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

