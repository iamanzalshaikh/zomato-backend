import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";
import { UserRole } from "../types/enums.js";

const ACCESS_EXPIRES_IN = "7d";
const REFRESH_EXPIRES_IN = "30d";

export interface UserTokenPayload extends JwtPayload {
  userId: string;
  role?: UserRole;
  tokenId?: string;
}

export function signUserAccessToken(userId: string, role?: UserRole): string {
  return jwt.sign({ userId, role }, config.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function signUserRefreshToken(
  userId: string,
  role?: UserRole,
  tokenId?: string,
): string {
  return jwt.sign({ userId, role, tokenId }, config.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export function verifyUserAccessToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export function verifyUserRefreshToken(
  token: string,
): UserTokenPayload | null {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}
