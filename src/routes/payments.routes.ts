import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paymentRateLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
} from "../validators/payment.validator.js";
import {
  createOrderPayment,
  verifyOrderPayment,
  getPayment,
  refundPayment,
  walletAddMoneyStub,
} from "../controllers/payments.controller.js";

const router = Router();

router.use(paymentRateLimiter);

router.post(
  "/create-order",
  isAuth,
  validate(createPaymentOrderSchema),
  asyncHandler(createOrderPayment),
);
router.post(
  "/verify",
  isAuth,
  validate(verifyPaymentSchema),
  asyncHandler(verifyOrderPayment),
);
router.post(
  "/refund",
  isAuth,
  validate(refundPaymentSchema),
  asyncHandler(refundPayment),
);
router.post("/wallet/add-money", isAuth, asyncHandler(walletAddMoneyStub));
router.get("/:paymentId", isAuth, asyncHandler(getPayment));

export default router;
