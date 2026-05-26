import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  globalSearchSchema,
  restaurantSearchSchema,
  foodSearchSchema,
  trendingSearchSchema,
} from "../validators/search.validator.js";
import {
  searchGlobal,
  searchRestaurantsOnly,
  searchFoodsOnly,
  searchTrending,
} from "../controllers/search.controller.js";

const router = Router();

router.get("/", validate(globalSearchSchema, "query"), asyncHandler(searchGlobal));
router.get(
  "/restaurants",
  validate(restaurantSearchSchema, "query"),
  asyncHandler(searchRestaurantsOnly),
);
router.get(
  "/foods",
  validate(foodSearchSchema, "query"),
  asyncHandler(searchFoodsOnly),
);
router.get(
  "/trending",
  validate(trendingSearchSchema, "query"),
  asyncHandler(searchTrending),
);

export default router;
