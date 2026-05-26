import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { verifyUserAccessToken } from "../utils/jwt.js";
import logger from "../config/logger.js";

const isAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const decoded = verifyUserAccessToken(token);
    if (!decoded?.userId) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }

    req.userId = decoded.userId;
    if (decoded.role) {
      req.userRole = decoded.role;
    }
    logger.debug(`User authenticated: ${decoded.userId}`);
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth failed";
    res.status(401).json({ success: false, message: "Authentication failed", error: message });
  }
};

export default isAuth;
