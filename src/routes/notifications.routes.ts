import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  registerDeviceTokenSchema,
  removeDeviceTokenSchema,
} from "../validators/notification.validator.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  registerDevice,
  unregisterDevice,
} from "../controllers/notifications.controller.js";

const router = Router();

router.use(isAuth);

router.get("/", asyncHandler(getNotifications));
router.patch("/read-all", asyncHandler(markAllNotificationsRead));
router.patch("/read/:notificationId", asyncHandler(markNotificationRead));
router.delete("/:notificationId", asyncHandler(deleteNotification));
router.post(
  "/device-token",
  validate(registerDeviceTokenSchema),
  asyncHandler(registerDevice),
);
router.delete(
  "/device-token",
  validate(removeDeviceTokenSchema),
  asyncHandler(unregisterDevice),
);

export default router;
