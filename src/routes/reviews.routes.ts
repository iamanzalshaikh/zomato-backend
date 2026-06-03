import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createReview,
  deleteReview,
  getRestaurantReviews,
  getRiderReviews,
  updateReview,
} from "../controllers/reviews.controller.js";
import {
  createReviewSchema,
  listReviewsQuerySchema,
  updateReviewSchema,
} from "../validators/reviews.validator.js";

const router = Router();

router.post("/", isAuth, validate(createReviewSchema), asyncHandler(createReview));
router.patch(
  "/:reviewId",
  isAuth,
  validate(updateReviewSchema),
  asyncHandler(updateReview),
);
router.delete("/:reviewId", isAuth, asyncHandler(deleteReview));

router.get(
  "/restaurant/:restaurantId",
  validate(listReviewsQuerySchema, "query"),
  asyncHandler(getRestaurantReviews),
);
router.get(
  "/rider/:riderId",
  validate(listReviewsQuerySchema, "query"),
  asyncHandler(getRiderReviews),
);

export default router;

