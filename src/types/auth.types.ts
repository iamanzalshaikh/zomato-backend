import { Request } from "express";
import { AccountStatus, AdminRole, UserRole } from "./enums.js";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
  adminId?: string;
  adminRole?: AdminRole;
}

export interface IAuthUser {
  _id: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  role: UserRole;
  onboardingCompleted: boolean;
  onboardingStep: number;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse extends IAuthTokens {
  user: IAuthUser;
}
