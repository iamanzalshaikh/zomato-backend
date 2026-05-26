import redisClient from "../config/redis.js";
import { hashOTP, verifyOTP } from "../utils/otp.js";

const OTP_PREFIX = "otp:";
const OTP_TTL_SECONDS = 10 * 60;

export type OtpPurpose = "signup" | "login" | "reset";

export interface StoredOtp {
  hash: string;
  email: string;
  phone?: string;
  purpose: OtpPurpose;
}

const key = (purpose: string, email: string) =>
  `${OTP_PREFIX}${purpose}:${email}`;

export const saveOtp = async (
  purpose: OtpPurpose,
  email: string,
  otp: string,
  phone?: string,
): Promise<void> => {
  const hash = await hashOTP(otp);
  const data: StoredOtp = { hash, email, phone, purpose };
  await redisClient.setEx(key(purpose, email), OTP_TTL_SECONDS, JSON.stringify(data));
};

export const getOtp = async (
  purpose: OtpPurpose,
  email: string,
): Promise<StoredOtp | null> => {
  const raw = await redisClient.get(key(purpose, email));
  if (!raw) return null;
  return JSON.parse(raw) as StoredOtp;
};

export const verifyStoredOtp = async (
  purpose: OtpPurpose,
  email: string,
  otp: string,
): Promise<boolean> => {
  const stored = await getOtp(purpose, email);
  if (!stored) return false;
  return verifyOTP(otp, stored.hash);
};

export const deleteOtp = async (
  purpose: OtpPurpose,
  email: string,
): Promise<void> => {
  await redisClient.del(key(purpose, email));
};
