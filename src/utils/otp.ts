import bcrypt from "bcryptjs";
import logger from "../config/logger.js";

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  try {
    return bcrypt.compare(otp, hash);
  } catch (error) {
    logger.error(`[OTP] verify failed: ${error}`);
    return false;
  }
}

export function calculateOTPExpiry(minutes = 10): number {
  return Date.now() + minutes * 60 * 1000;
}

export function isOTPExpired(expiryDate: number): boolean {
  return Date.now() > expiryDate;
}
