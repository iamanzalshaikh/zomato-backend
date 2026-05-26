import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Rider from "../models/rider.model.js";
import logger from "../config/logger.js";
import {
  NotificationType,
  NotificationRedirect,
  DevicePlatform,
} from "../types/enums.js";
import { orderNotificationCopy } from "./notification.templates.js";
import { SocketEvents } from "../types/socket.events.js";
import { enqueueNotificationJob } from "../queues/notification.queue.js";
import { enqueueEmailJob } from "../queues/email.queue.js";
import { enqueueSmsJob } from "../queues/sms.queue.js";
import { AppError } from "../utils/AppError.js";

export type NotificationChannel = "in_app" | "email" | "push" | "sms";

export type NotificationJobType =
  | "send_in_app"
  | "send_email"
  | "send_push"
  | "send_sms"
  | "notify_user";

export interface NotificationJobPayload {
  jobType: NotificationJobType;
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  channels?: NotificationChannel[];
  redirectType?: NotificationRedirect;
  redirectId?: string;
  email?: string;
  mobile?: string;
}

export async function createInAppNotification(input: {
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  redirectType?: NotificationRedirect;
  redirectId?: mongoose.Types.ObjectId | string;
  image?: string;
}) {
  return Notification.create({
    userId: input.userId,
    notificationType: input.notificationType,
    title: input.title,
    message: input.message,
    image: input.image,
    redirectType: input.redirectType,
    redirectId: input.redirectId,
    isRead: false,
    sentAt: new Date(),
  });
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  await enqueueEmailJob({
    to,
    subject,
    html: `<div>${html}</div>`,
  });
}

export async function sendSmsNotification(
  mobile: string,
  message: string,
): Promise<void> {
  await enqueueSmsJob({ mobile, message });
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const user = await User.findById(userId).select("deviceTokens");
  const tokens = user?.deviceTokens ?? [];
  if (tokens.length === 0) {
    logger.debug(`[Push stub] no device tokens for user=${userId}`);
    return;
  }
  for (const dt of tokens) {
    logger.info(
      `[Push stub] platform=${dt.platform} token=${dt.token.slice(0, 12)}... title=${title}`,
      data,
    );
  }
}

export async function notifyUser(job: NotificationJobPayload): Promise<void> {
  const channels = job.channels ?? ["in_app", "email", "push"];

  if (channels.includes("in_app")) {
    await createInAppNotification({
      userId: job.userId,
      notificationType: job.notificationType,
      title: job.title,
      message: job.message,
      redirectType: job.redirectType,
      redirectId: job.redirectId,
    });
  }

  const user = await User.findById(job.userId).select("email mobile deviceTokens");
  const email = job.email ?? user?.email;
  const mobile = job.mobile ?? user?.mobile;

  if (channels.includes("email") && email) {
    await sendEmailNotification(email, job.title, job.message);
  }

  if (channels.includes("sms") && mobile) {
    await sendSmsNotification(mobile, job.message);
  }

  if (channels.includes("push")) {
    await sendPushNotification(job.userId, job.title, job.message, {
      redirectType: job.redirectType ?? "",
      redirectId: job.redirectId ?? "",
    });
  }
}

export async function processNotificationJob(
  job: NotificationJobPayload,
): Promise<void> {
  switch (job.jobType) {
    case "send_in_app":
      await createInAppNotification({
        userId: job.userId,
        notificationType: job.notificationType,
        title: job.title,
        message: job.message,
        redirectType: job.redirectType,
        redirectId: job.redirectId,
      });
      break;
    case "send_email":
      if (job.email) {
        await enqueueEmailJob({
          to: job.email,
          subject: job.title,
          html: `<div>${job.message}</div>`,
        });
      }
      break;
    case "send_sms":
      if (job.mobile) {
        await enqueueSmsJob({ mobile: job.mobile, message: job.message });
      }
      break;
    case "send_push":
      await sendPushNotification(job.userId, job.title, job.message);
      break;
    case "notify_user":
    default:
      await notifyUser(job);
      break;
  }
}

export function queueNotifyUser(
  input: Omit<NotificationJobPayload, "jobType"> & {
    jobType?: NotificationJobType;
  },
): void {
  const job: NotificationJobPayload = {
    jobType: input.jobType ?? "notify_user",
    userId: input.userId,
    title: input.title,
    message: input.message,
    notificationType: input.notificationType,
    channels: input.channels,
    redirectType: input.redirectType,
    redirectId: input.redirectId,
    email: input.email,
    mobile: input.mobile,
  };
  void enqueueNotificationJob(job);
}

type OrderNotifyLike = {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  restaurantId: mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId };
  customerId: mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId };
  riderId?: mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId };
};

function refId(
  value: mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId },
): string {
  if (value && typeof value === "object" && "_id" in value && value._id) {
    return value._id.toString();
  }
  return value.toString();
}

function customerChannels(event: string): NotificationChannel[] {
  if (event === SocketEvents.RIDER_LOCATION_UPDATE) {
    return ["in_app", "push"];
  }
  return ["in_app", "email", "push"];
}

export async function notifyOrderEvent(
  order: OrderNotifyLike,
  event: string,
): Promise<void> {
  if (event === SocketEvents.RIDER_LOCATION_UPDATE) {
    return;
  }

  const copy = orderNotificationCopy(event, order.orderNumber);
  const orderId = order._id.toString();
  const customerId = refId(order.customerId);

  queueNotifyUser({
    userId: customerId,
    notificationType: NotificationType.ORDER,
    title: copy.title,
    message: copy.message,
    channels: customerChannels(event),
    redirectType: NotificationRedirect.ORDER,
    redirectId: orderId,
  });

  if (event === SocketEvents.ORDER_CREATED || event === SocketEvents.NEW_ORDER) {
    const restaurant = await Restaurant.findById(refId(order.restaurantId)).select(
      "ownerId restaurantName",
    );
    if (restaurant) {
      const restaurantCopy = orderNotificationCopy(
        SocketEvents.NEW_ORDER,
        order.orderNumber,
      );
      queueNotifyUser({
        userId: restaurant.ownerId.toString(),
        notificationType: NotificationType.ORDER,
        title: restaurantCopy.title,
        message: `${restaurantCopy.message} (${restaurant.restaurantName})`,
        channels: ["in_app", "email", "push"],
        redirectType: NotificationRedirect.ORDER,
        redirectId: orderId,
      });
    }
  }

  if (
    event === SocketEvents.RIDER_ASSIGNED &&
    order.riderId
  ) {
    const rider = await Rider.findById(refId(order.riderId)).select("userId");
    if (rider) {
      queueNotifyUser({
        userId: rider.userId.toString(),
        notificationType: NotificationType.ORDER,
        title: "New delivery",
        message: `You are assigned to order ${order.orderNumber}.`,
        channels: ["in_app", "push"],
        redirectType: NotificationRedirect.ORDER,
        redirectId: orderId,
      });
    }
  }
}

export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: DevicePlatform,
) {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  const existing = user.deviceTokens.find((d) => d.token === token);
  if (existing) {
    existing.platform = platform;
  } else {
    user.deviceTokens.push({ token, platform });
  }
  await user.save();
  return user.deviceTokens;
}

export async function removeDeviceToken(userId: string, token: string) {
  const user = await User.findById(userId);
  if (!user) return;
  user.deviceTokens = user.deviceTokens.filter((d) => d.token !== token) as typeof user.deviceTokens;
  await user.save();
}
