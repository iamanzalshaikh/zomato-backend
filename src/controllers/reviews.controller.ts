import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createReviewForOrder,
  deleteMyReview,
  listRestaurantReviews,
  listRiderReviews,
  updateMyReview,
} from "../services/reviews.service.js";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// POST /reviews
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await createReviewForOrder(req.userId!, req.body);
    sendSuccess(res, "Review submitted", { review }, 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /reviews/:reviewId
export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviewId = paramId(req.params.reviewId);
    const review = await updateMyReview(req.userId!, reviewId, req.body);
    sendSuccess(res, "Review updated", { review });
  } catch (err) {
    next(err);
  }
};

// DELETE /reviews/:reviewId
export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviewId = paramId(req.params.reviewId);
    await deleteMyReview(req.userId!, reviewId);
    sendSuccess(res, "Review deleted", {});
  } catch (err) {
    next(err);
  }
};

// GET /reviews/restaurant/:restaurantId
export const getRestaurantReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restaurantId = paramId(req.params.restaurantId);
    const { page, limit } = req.query as any;
    const result = await listRestaurantReviews(restaurantId, page, limit);
    sendSuccess(res, "Restaurant reviews", result);
  } catch (err) {
    next(err);
  }
};

// GET /reviews/rider/:riderId
export const getRiderReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const riderId = paramId(req.params.riderId);
    const { page, limit } = req.query as any;
    const result = await listRiderReviews(riderId, page, limit);
    sendSuccess(res, "Rider reviews", result);
  } catch (err) {
    next(err);
  }
};

