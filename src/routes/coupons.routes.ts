import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCouponsByRestaurant,
  createCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import isAdminAuth from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Public: get active coupons for a restaurant (customer-facing)
router.get("/restaurant/:restaurantId", asyncHandler(getCouponsByRestaurant));

// Admin: create and delete coupons (admin panel integration)
router.post("/", isAdminAuth, asyncHandler(createCoupon));
router.delete("/:couponId", isAdminAuth, asyncHandler(deleteCoupon));

export default router;
