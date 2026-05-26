import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const rejectReasonSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const adminCancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});
