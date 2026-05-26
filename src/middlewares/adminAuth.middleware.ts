import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { verifyAdminAccessToken } from "../utils/jwtAdmin.js";

const isAdminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.cookies?.adminToken;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ success: false, message: "Admin token required" });
      return;
    }

    const decoded = verifyAdminAccessToken(token);
    if (!decoded?.adminId) {
      res.status(401).json({ success: false, message: "Invalid admin token" });
      return;
    }

    req.adminId = decoded.adminId;
    req.adminRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Admin authentication failed" });
  }
};

export default isAdminAuth;
