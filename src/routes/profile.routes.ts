/**
 * Legacy /profile routes — alias to /users handlers (Phase 4).
 * Prefer /api/v1/users/* per endpoints.md.
 */
import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateProfileSchema } from "../validators/user.validator.js";
import {
  getProfile,
  updateProfile,
  completeOnboarding,
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", isAuth, asyncHandler(getProfile));
router.patch("/", isAuth, validate(updateProfileSchema), asyncHandler(updateProfile));
router.post("/onboarding/complete", isAuth, asyncHandler(completeOnboarding));

export default router;
