import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { verifyUserAccessToken } from "../utils/jwt.js";

const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (token) {
    const decoded = verifyUserAccessToken(token);
    if (decoded?.userId) {
      req.userId = decoded.userId;
    }
  }

  next();
};

export default optionalAuth;
