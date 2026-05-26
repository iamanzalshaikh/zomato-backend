import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import Notification from "../models/notification.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { getPagination, paginationMeta } from "../helpers/pagination.js";
import {
  registerDeviceToken,
  removeDeviceToken,
} from "../services/notification.service.js";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// GET /notifications
export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(
      req.query.page as string | undefined,
      req.query.limit as string | undefined,
    );

    const filter = { userId: req.userId };
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ sentAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    sendSuccess(res, "Notifications fetched", {
      notifications,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/read/:notificationId
export const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: paramId(req.params.notificationId), userId: req.userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      sendError(res, "Notification not found", 404);
      return;
    }

    sendSuccess(res, "Notification marked as read", { notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/read-all
export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    sendSuccess(res, "All notifications marked as read");
  } catch (err) {
    next(err);
  }
};

// DELETE /notifications/:notificationId
export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: paramId(req.params.notificationId),
      userId: req.userId,
    });
    if (!notification) {
      sendError(res, "Notification not found", 404);
      return;
    }
    sendSuccess(res, "Notification deleted");
  } catch (err) {
    next(err);
  }
};

// POST /notifications/device-token
export const registerDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tokens = await registerDeviceToken(
      req.userId!,
      req.body.token,
      req.body.platform,
    );
    sendSuccess(res, "Device token registered", { deviceTokens: tokens });
  } catch (err) {
    next(err);
  }
};

// DELETE /notifications/device-token
export const unregisterDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await removeDeviceToken(req.userId!, req.body.token);
    sendSuccess(res, "Device token removed");
  } catch (err) {
    next(err);
  }
};
