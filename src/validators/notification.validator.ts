import { z } from "zod";
import { DevicePlatform } from "../types/enums.js";

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(10).max(500),
  platform: z.nativeEnum(DevicePlatform),
});

export const removeDeviceTokenSchema = z.object({
  token: z.string().min(10),
});
