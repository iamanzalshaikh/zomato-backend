import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { UserRole } from "../types/enums.js";
import User from "../models/user.model.js";

export const requireRole =
  (...allowedRoles: UserRole[]) =>
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!req.userRole) {
      const user = await User.findById(req.userId).select("role");
      if (!user) {
        res.status(401).json({ success: false, message: "User not found" });
        return;
      }
      req.userRole = user.role;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };

export const requireCustomer = requireRole(UserRole.CUSTOMER);
export const requireRestaurantOwner = requireRole(UserRole.RESTAURANT_OWNER);
export const requireRider = requireRole(UserRole.RIDER);
