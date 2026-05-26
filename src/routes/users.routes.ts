import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  updateProfileSchema,
  profileImageSchema,
  addressSchema,
  updateAddressSchema,
} from "../validators/user.validator.js";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  addAddress,
  updateAddress,
  deleteAddress,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUserOrders,
  getWallet,
  getWalletTransactions,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAccount,
  completeOnboarding,
} from "../controllers/users.controller.js";

const router = Router();

router.use(isAuth);

router.get("/profile", asyncHandler(getProfile));
router.patch("/profile", validate(updateProfileSchema), asyncHandler(updateProfile));
router.post(
  "/profile-image",
  validate(profileImageSchema),
  asyncHandler(uploadProfileImage),
);

router.post("/address", validate(addressSchema), asyncHandler(addAddress));
router.patch(
  "/address/:addressId",
  validate(updateAddressSchema),
  asyncHandler(updateAddress),
);
router.delete("/address/:addressId", asyncHandler(deleteAddress));

router.get("/favorites", asyncHandler(getFavorites));
router.post("/favorites/:restaurantId", asyncHandler(addFavorite));
router.delete("/favorites/:restaurantId", asyncHandler(removeFavorite));

router.get("/orders", asyncHandler(getUserOrders));

router.get("/wallet", asyncHandler(getWallet));
router.get("/wallet/transactions", asyncHandler(getWalletTransactions));

router.get("/notifications", asyncHandler(getNotifications));
router.patch(
  "/notifications/read/:notificationId",
  asyncHandler(markNotificationRead),
);
router.patch("/notifications/read-all", asyncHandler(markAllNotificationsRead));

router.post("/onboarding/complete", asyncHandler(completeOnboarding));
router.delete("/delete-account", asyncHandler(deleteAccount));

export default router;
