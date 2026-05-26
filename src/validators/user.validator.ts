import { z } from "zod";

const mobileField = z
  .string()
  .regex(/^[0-9]{10}$/, "Mobile must be 10 digits")
  .optional();

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  name: z.string().min(2).max(80).optional(),
  mobile: mobileField,
  phone: mobileField,
  profileImage: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
});

export const profileImageSchema = z.object({
  profileImage: z.string().url("Valid image URL required"),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(30),
  fullAddress: z.string().min(5).max(300),
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  landmark: z.string().max(200).optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressSchema.partial();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
