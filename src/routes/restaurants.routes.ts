import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateStatusSchema,
  listRestaurantsQuerySchema,
  nearbyQuerySchema,
  searchQuerySchema,
} from "../validators/restaurant.validator.js";
import {
  createRestaurant,
  getRestaurants,
  getNearbyRestaurants,
  searchRestaurantsHandler,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
  getRestaurantAnalytics,
  approveRestaurantDev,
} from "../controllers/restaurants.controller.js";

const router = Router();

// Public browse flow (Zomato: discover → search → nearby)
router.get(
  "/search",
  validate(searchQuerySchema, "query"),
  asyncHandler(searchRestaurantsHandler),
);
router.get(
  "/nearby",
  validate(nearbyQuerySchema, "query"),
  asyncHandler(getNearbyRestaurants),
);
router.get(
  "/",
  validate(listRestaurantsQuerySchema, "query"),
  asyncHandler(getRestaurants),
);

// Owner / partner flow
router.post(
  "/",
  isAuth,
  validate(createRestaurantSchema),
  asyncHandler(createRestaurant),
);

// Static paths before :restaurantId
router.patch(
  "/status/:restaurantId",
  isAuth,
  validate(updateStatusSchema),
  asyncHandler(updateRestaurantStatus),
);
router.get(
  "/analytics/:restaurantId",
  isAuth,
  asyncHandler(getRestaurantAnalytics),
);
router.patch(
  "/:restaurantId/approve-dev",
  isAuth,
  asyncHandler(approveRestaurantDev),
);

router.get("/:restaurantId", optionalAuth, asyncHandler(getRestaurantById));
router.patch(
  "/:restaurantId",
  isAuth,
  validate(updateRestaurantSchema),
  asyncHandler(updateRestaurant),
);
router.delete("/:restaurantId", isAuth, asyncHandler(deleteRestaurant));

export default router;
