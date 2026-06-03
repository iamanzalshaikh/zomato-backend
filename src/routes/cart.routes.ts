import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  applyCouponSchema,
} from "../validators/cart.validator.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  updateCartPreferences,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(isAuth);

router.get("/", asyncHandler(getCart));
router.post("/add", validate(addToCartSchema), asyncHandler(addToCart));
router.patch(
  "/update/:itemId",
  validate(updateCartItemSchema),
  asyncHandler(updateCartItem),
);
router.delete("/remove/:itemId", asyncHandler(removeCartItem));
router.delete("/clear", asyncHandler(clearCart));
router.post(
  "/apply-coupon",
  validate(applyCouponSchema),
  asyncHandler(applyCoupon),
);
router.delete("/remove-coupon", asyncHandler(removeCoupon));
router.patch("/preferences", asyncHandler(updateCartPreferences));

export default router;
