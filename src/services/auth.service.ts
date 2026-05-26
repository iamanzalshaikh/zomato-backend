import { Response } from "express";
import User from "../models/user.model.js";
import { IAuthUser } from "../types/auth.types.js";
import { AccountStatus, UserRole } from "../types/enums.js";
import { AppError } from "../utils/AppError.js";
import { issueAuthTokens } from "./token.service.js";

export function formatAuthUser(user: InstanceType<typeof User>): IAuthUser {
  return {
    _id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    profileImage: user.profileImage,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export async function findActiveUserByEmail(email: string) {
  return User.findOne({ email, isDeleted: false }).select("+password");
}

export function assertAccountActive(user: InstanceType<typeof User>) {
  if (user.accountStatus === AccountStatus.BLOCKED) {
    throw new AppError("Your account has been blocked", 403);
  }
  if (user.accountStatus === AccountStatus.SUSPENDED) {
    throw new AppError("Your account is suspended", 403);
  }
}

export async function buildAuthResponse(
  user: InstanceType<typeof User>,
  res: Response,
  message: string,
  statusCode = 200,
) {
  const tokens = await issueAuthTokens(user._id.toString(), user.role);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  return {
    statusCode,
    body: {
      success: true,
      message,
      data: {
        user: formatAuthUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    },
  };
}

export function parseRole(role?: string): UserRole {
  const allowed = Object.values(UserRole);
  if (role && allowed.includes(role as UserRole)) {
    return role as UserRole;
  }
  return UserRole.CUSTOMER;
}
