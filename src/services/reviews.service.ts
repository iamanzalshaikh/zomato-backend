import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import Rider from "../models/rider.model.js";
import { OrderStatus } from "../types/enums.js";
import { AppError } from "../utils/AppError.js";

type CreateReviewInput = {
  orderId: string;
  restaurantRating?: number;
  deliveryRating?: number;
  foodRating?: number;
  reviewText?: string;
  images?: string[];
};

type UpdateReviewInput = {
  restaurantRating?: number;
  deliveryRating?: number;
  foodRating?: number;
  reviewText?: string;
  images?: string[];
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

async function recomputeRestaurantRatings(restaurantId: mongoose.Types.ObjectId) {
  const agg = await Review.aggregate<{ _id: mongoose.Types.ObjectId; avg: number; count: number }>([
    {
      $match: {
        restaurantId,
        restaurantRating: { $gte: 1, $lte: 5 },
      },
    },
    {
      $group: {
        _id: "$restaurantId",
        avg: { $avg: "$restaurantRating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const row = agg[0];
  const averageRating = row ? round1(row.avg) : 0;
  const totalRatings = row ? row.count : 0;

  await Restaurant.updateOne(
    { _id: restaurantId },
    { $set: { averageRating, totalRatings } },
  );
}

async function recomputeRiderRatings(riderId: mongoose.Types.ObjectId) {
  const agg = await Review.aggregate<{ _id: mongoose.Types.ObjectId; avg: number; count: number }>([
    {
      $match: {
        riderId,
        deliveryRating: { $gte: 1, $lte: 5 },
      },
    },
    {
      $group: {
        _id: "$riderId",
        avg: { $avg: "$deliveryRating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const row = agg[0];
  const averageRating = row ? round1(row.avg) : 0;
  await Rider.updateOne({ _id: riderId }, { $set: { averageRating } });
}

async function recomputeAggregates(restaurantId: mongoose.Types.ObjectId, riderId?: mongoose.Types.ObjectId) {
  await recomputeRestaurantRatings(restaurantId);
  if (riderId) {
    await recomputeRiderRatings(riderId);
  }
}

export async function createReviewForOrder(customerId: string, input: CreateReviewInput) {
  const order = await Order.findById(input.orderId).select(
    "_id customerId restaurantId riderId orderStatus deliveredAt",
  );
  if (!order) throw new AppError("Order not found", 404);
  if (order.customerId.toString() !== customerId) {
    throw new AppError("Not allowed to review this order", 403);
  }
  if (order.orderStatus !== OrderStatus.DELIVERED) {
    throw new AppError("You can only review after delivery", 400);
  }

  const hasAnyRating =
    typeof input.restaurantRating === "number" ||
    typeof input.deliveryRating === "number" ||
    typeof input.foodRating === "number" ||
    (input.reviewText?.trim()?.length ?? 0) > 0 ||
    (input.images?.length ?? 0) > 0;
  if (!hasAnyRating) {
    throw new AppError("At least one rating or reviewText/images is required", 400);
  }

  try {
    const review = await Review.create({
      orderId: order._id,
      customerId: new mongoose.Types.ObjectId(customerId),
      restaurantId: order.restaurantId,
      riderId: order.riderId,
      restaurantRating: input.restaurantRating,
      deliveryRating: input.deliveryRating,
      foodRating: input.foodRating,
      reviewText: input.reviewText,
      images: input.images ?? [],
    });

    await recomputeAggregates(order.restaurantId, order.riderId);
    return review;
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new AppError("Review already submitted for this order", 409);
    }
    throw err;
  }
}

export async function updateMyReview(customerId: string, reviewId: string, input: UpdateReviewInput) {
  const id = new mongoose.Types.ObjectId(reviewId);
  const review = await Review.findById(id);
  if (!review) throw new AppError("Review not found", 404);
  if (review.customerId.toString() !== customerId) {
    throw new AppError("Not allowed", 403);
  }

  if (typeof input.restaurantRating === "number") review.restaurantRating = input.restaurantRating;
  if (typeof input.deliveryRating === "number") review.deliveryRating = input.deliveryRating;
  if (typeof input.foodRating === "number") review.foodRating = input.foodRating;
  if (typeof input.reviewText === "string") review.reviewText = input.reviewText;
  if (Array.isArray(input.images)) review.images = input.images;

  await review.save();
  await recomputeAggregates(review.restaurantId, review.riderId);
  return review;
}

export async function deleteMyReview(customerId: string, reviewId: string) {
  const id = new mongoose.Types.ObjectId(reviewId);
  const review = await Review.findById(id);
  if (!review) throw new AppError("Review not found", 404);
  if (review.customerId.toString() !== customerId) {
    throw new AppError("Not allowed", 403);
  }

  await review.deleteOne();
  await recomputeAggregates(review.restaurantId, review.riderId);
}

export async function listRestaurantReviews(restaurantId: string, page: number, limit: number) {
  const rid = new mongoose.Types.ObjectId(restaurantId);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Review.find({ restaurantId: rid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "customerId", select: "fullName profileImage" })
      .lean(),
    Review.countDocuments({ restaurantId: rid }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function listRiderReviews(riderId: string, page: number, limit: number) {
  const rid = new mongoose.Types.ObjectId(riderId);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Review.find({ riderId: rid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "customerId", select: "fullName profileImage" })
      .lean(),
    Review.countDocuments({ riderId: rid }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

