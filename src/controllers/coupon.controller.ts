import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import Coupon from "../models/coupon.model.js";
import Restaurant from "../models/restaurant.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { CouponStatus } from "../types/enums.js";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// GET /coupons/restaurant/:restaurantId — public, no auth required
export const getCouponsByRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restaurantId = paramId(req.params.restaurantId);

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      sendError(res, "Restaurant not found", 404);
      return;
    }

    const now = new Date();
    const coupons = await Coupon.find({
      status: CouponStatus.ACTIVE,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $or: [
        { applicableRestaurants: { $size: 0 } }, // global coupons
        { applicableRestaurants: restaurantId },   // restaurant-specific
      ],
    })
      .select("couponCode title description discountType discountValue minimumOrderAmount maximumDiscount validTo usageLimit usedCount")
      .sort({ discountValue: -1 })
      .lean();

    sendSuccess(res, "Coupons fetched", { coupons, count: coupons.length });
  } catch (err) {
    next(err);
  }
};

// POST /coupons — Admin only
export const createCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      couponCode,
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      validFrom,
      validTo,
      applicableRestaurants,
      status,
    } = req.body;

    if (!couponCode || !title || !discountType || discountValue === undefined || !validFrom || !validTo) {
      sendError(res, "Missing required fields", 400);
      return;
    }

    const existing = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
    if (existing) {
      sendError(res, "Coupon code already exists", 400);
      return;
    }

    const coupon = new Coupon({
      couponCode,
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      applicableRestaurants: applicableRestaurants || [],
      status: status || CouponStatus.ACTIVE,
    });

    await coupon.save();

    sendSuccess(res, "Coupon created successfully", { coupon }, 201);
  } catch (err) {
    next(err);
  }
};

// DELETE /coupons/:couponId — Admin only
export const deleteCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const couponId = paramId(req.params.couponId);
    const deleted = await Coupon.findByIdAndDelete(couponId);
    if (!deleted) {
      sendError(res, "Coupon not found", 404);
      return;
    }
    sendSuccess(res, "Coupon deleted successfully", { deleted });
  } catch (err) {
    next(err);
  }
};
