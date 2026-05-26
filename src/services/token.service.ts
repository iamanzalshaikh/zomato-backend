import crypto from "crypto";
import redisClient from "../config/redis.js";
import {
  signUserAccessToken,
  signUserRefreshToken,
  verifyUserRefreshToken,
  UserTokenPayload,
} from "../utils/jwt.js";
import { UserRole } from "../types/enums.js";

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

const refreshKey = (tokenId: string) => `refresh:${tokenId}`;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const issueAuthTokens = async (
  userId: string,
  role: UserRole,
): Promise<AuthTokens> => {
  const tokenId = crypto.randomUUID();
  const accessToken = signUserAccessToken(userId, role);
  const refreshToken = signUserRefreshToken(userId, role, tokenId);

  await redisClient.setEx(
    refreshKey(tokenId),
    REFRESH_TTL_SECONDS,
    JSON.stringify({ userId, role }),
  );

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (
  refreshToken: string,
): Promise<AuthTokens | null> => {
  const decoded = verifyUserRefreshToken(refreshToken);
  if (!decoded?.userId || !decoded.tokenId) return null;

  const stored = await redisClient.get(refreshKey(decoded.tokenId));
  if (!stored) return null;

  await redisClient.del(refreshKey(decoded.tokenId));

  const parsed = JSON.parse(stored) as { userId: string; role: UserRole };
  if (parsed.userId !== decoded.userId) return null;

  return issueAuthTokens(parsed.userId, parsed.role);
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  const decoded = verifyUserRefreshToken(refreshToken);
  if (decoded?.tokenId) {
    await redisClient.del(refreshKey(decoded.tokenId));
  }
};

export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  const keys = await redisClient.keys(`refresh:*`);
  for (const key of keys) {
    const raw = await redisClient.get(key);
    if (!raw) continue;
    const data = JSON.parse(raw) as { userId: string };
    if (data.userId === userId) {
      await redisClient.del(key);
    }
  }
};

export const getRefreshPayload = (
  refreshToken: string,
): UserTokenPayload | null => verifyUserRefreshToken(refreshToken);
