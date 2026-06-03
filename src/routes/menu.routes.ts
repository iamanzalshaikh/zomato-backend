import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  toggleAvailabilitySchema,
  menuSearchSchema,
} from "../validators/menu.validator.js";
import {
  createCategory,
  getCategoriesByRestaurant,
  updateCategory,
  deleteCategory,
  createMenuItem,
  getMenuItemsByRestaurant,
  getCombosByRestaurant,
  getMenuItemDetails,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  searchMenuItems,
} from "../controllers/menu.controller.js";

const router = Router();

// Categories
router.post(
  "/categories",
  isAuth,
  validate(createCategorySchema),
  asyncHandler(createCategory),
);
router.get(
  "/categories/:restaurantId",
  asyncHandler(getCategoriesByRestaurant),
);

// Search (before /items/:restaurantId)
router.get(
  "/search",
  validate(menuSearchSchema, "query"),
  asyncHandler(searchMenuItems),
);

// Items — static paths first
router.post("/items", isAuth, validate(createMenuItemSchema), asyncHandler(createMenuItem));
router.get("/items/details/:itemId", asyncHandler(getMenuItemDetails));
router.patch(
  "/items/availability/:itemId",
  isAuth,
  validate(toggleAvailabilitySchema),
  asyncHandler(toggleItemAvailability),
);

router.get("/items/combos/:restaurantId", asyncHandler(getCombosByRestaurant));
router.get("/items/:restaurantId", asyncHandler(getMenuItemsByRestaurant));
router.patch(
  "/items/:itemId",
  isAuth,
  validate(updateMenuItemSchema),
  asyncHandler(updateMenuItem),
);
router.delete("/items/:itemId", isAuth, asyncHandler(deleteMenuItem));

// Category update/delete
router.patch(
  "/categories/:categoryId",
  isAuth,
  validate(updateCategorySchema),
  asyncHandler(updateCategory),
);
router.delete("/categories/:categoryId", isAuth, asyncHandler(deleteCategory));

export default router;
