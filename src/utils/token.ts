import crypto from "crypto";

export const generateToken = (length = 32): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateSecureToken = (length = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const isValidToken = (token: string): boolean => {
  return typeof token === "string" && token.length >= 16 && token.length <= 64;
};
