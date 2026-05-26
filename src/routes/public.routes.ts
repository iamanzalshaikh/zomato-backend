import { Router } from "express";
import { getAppInfo, getTerms } from "../controllers/public.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/info", asyncHandler(getAppInfo));
router.get("/terms", asyncHandler(getTerms));

export default router;
