import { z } from "zod";

const addonSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
});

export const addToCartSchema = z.object({
  restaurantId: z.string().min(1),
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  addons: z.array(addonSchema).optional(),
  specialInstructions: z.string().max(200).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20),
});

export const applyCouponSchema = z.object({
  couponCode: z.string().min(2).max(30),
});
