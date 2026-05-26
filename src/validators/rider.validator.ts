import { z } from "zod";
import { RiderAvailability, VehicleType } from "../types/enums.js";

export const registerRiderSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  mobile: z.string().regex(/^[0-9]{10}$/).optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  vehicleNumber: z.string().max(20).optional(),
  drivingLicense: z.string().max(50).optional(),
  aadhaarCard: z.string().max(20).optional(),
  bankAccountDetails: z
    .object({
      accountHolderName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
    })
    .optional(),
});

export const riderLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const updateRiderStatusSchema = z.object({
  onlineStatus: z.boolean().optional(),
  availabilityStatus: z.nativeEnum(RiderAvailability).optional(),
});

export const rejectOrderSchema = z.object({
  reason: z.string().max(300).optional(),
});

/** Logged-in user adding a rider profile (no new email/password) */
export const onboardRiderSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType).optional(),
  vehicleNumber: z.string().max(20).optional(),
  drivingLicense: z.string().max(50).optional(),
  aadhaarCard: z.string().max(20).optional(),
  bankAccountDetails: z
    .object({
      accountHolderName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
    })
    .optional(),
});
