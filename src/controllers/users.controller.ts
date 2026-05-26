import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../types/auth.types.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import Notification from "../models/notification.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { normalizePhone } from "../utils/validators.js";
import { getPagination, paginationMeta } from "../helpers/pagination.js";
import { revokeAllUserSessions } from "../services/token.service.js";
import { AppError } from "../utils/AppError.js";
import { AccountStatus } from "../types/enums.js";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

async function getUserOrFail(userId: string) {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }
  return user;
}

// GET /users/profile
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    sendSuccess(res, "Profile fetched", { user: user.getPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    const { fullName, name, profileImage, avatarUrl, gender, dateOfBirth } =
      req.body;
    const mobileRaw = req.body.mobile || req.body.phone;

    if (fullName || name) user.fullName = fullName || name;
    if (profileImage || avatarUrl) user.profileImage = profileImage || avatarUrl;
    if (mobileRaw) {
      const mobile = normalizePhone(mobileRaw);
      const taken = await User.findOne({
        mobile,
        _id: { $ne: user._id },
        isDeleted: false,
      });
      if (taken) {
        sendError(res, "Mobile number already in use", 400);
        return;
      }
      user.mobile = mobile;
    }
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();
    sendSuccess(res, "Profile updated", { user: user.getPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// POST /users/profile-image
export const uploadProfileImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    user.profileImage = req.body.profileImage;
    await user.save();
    sendSuccess(res, "Profile image updated", {
      profileImage: user.profileImage,
    });
  } catch (err) {
    next(err);
  }
};

// POST /users/address
export const addAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.set("isDefault", false);
      });
    }

    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();

    const added = user.addresses[user.addresses.length - 1];
    sendSuccess(res, "Address added", { address: added }, 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /users/address/:addressId
export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    const addressId = paramId(req.params.addressId);
    const address = user.addresses.id(addressId);
    if (!address) {
      sendError(res, "Address not found", 404);
      return;
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.set("isDefault", false);
      });
    }

    Object.assign(address, req.body);
    await user.save();
    sendSuccess(res, "Address updated", { address });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/address/:addressId
export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    const addressId = paramId(req.params.addressId);
    const address = user.addresses.id(addressId);
    if (!address) {
      sendError(res, "Address not found", 404);
      return;
    }

    const wasDefault = address.get("isDefault");
    user.addresses.pull(addressId);
    await user.save();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
      await user.save();
    }

    sendSuccess(res, "Address deleted");
  } catch (err) {
    next(err);
  }
};

// GET /users/favorites
export const getFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "favoriteRestaurants",
        match: { isDeleted: false },
        select:
          "restaurantName slug logo cuisines averageRating totalRatings isOpen restaurantStatus",
      })
      .lean();

    if (!user || user.isDeleted) {
      sendError(res, "User not found", 404);
      return;
    }

    sendSuccess(res, "Favorite restaurants fetched", {
      favorites: user.favoriteRestaurants,
    });
  } catch (err) {
    next(err);
  }
};

// POST /users/favorites/:restaurantId
export const addFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restaurantId = paramId(req.params.restaurantId);
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      sendError(res, "Invalid restaurant id", 400);
      return;
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isDeleted: false,
    });
    if (!restaurant) {
      sendError(res, "Restaurant not found", 404);
      return;
    }

    const user = await getUserOrFail(req.userId!);
    const exists = user.favoriteRestaurants.some(
      (id) => id.toString() === restaurantId,
    );
    if (exists) {
      sendError(res, "Restaurant already in favorites", 400);
      return;
    }

    user.favoriteRestaurants.push(new mongoose.Types.ObjectId(restaurantId));
    await user.save();

    sendSuccess(res, "Restaurant added to favorites", { restaurantId }, 201);
  } catch (err) {
    next(err);
  }
};

// DELETE /users/favorites/:restaurantId
export const removeFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    const restaurantId = paramId(req.params.restaurantId);

    user.favoriteRestaurants = user.favoriteRestaurants.filter(
      (id) => id.toString() !== restaurantId,
    );
    user.markModified("favoriteRestaurants");
    await user.save();
    sendSuccess(res, "Restaurant removed from favorites");
  } catch (err) {
    next(err);
  }
};

// GET /users/orders
export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(
      req.query.page as string | undefined,
      req.query.limit as string | undefined,
    );

    const filter = { customerId: req.userId };
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("restaurantId", "restaurantName logo slug")
        .lean(),
      Order.countDocuments(filter),
    ]);

    sendSuccess(res, "Orders fetched", {
      orders,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/wallet
export const getWallet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    sendSuccess(res, "Wallet fetched", {
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/wallet/transactions
export const getWalletTransactions = async (
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
    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    sendSuccess(res, "Wallet transactions fetched", {
      transactions,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/notifications
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
      Notification.find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
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

// PATCH /users/notifications/read/:notificationId
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

// PATCH /users/notifications/read-all
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

// DELETE /users/delete-account
export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    user.isDeleted = true;
    user.accountStatus = AccountStatus.SUSPENDED;
    await user.save();
    await revokeAllUserSessions(user._id.toString());

    res.clearCookie("token");
    res.clearCookie("refreshToken");
    sendSuccess(res, "Account deleted successfully");
  } catch (err) {
    next(err);
  }
};

// POST /users/onboarding/complete (moved from profile)
export const completeOnboarding = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserOrFail(req.userId!);
    user.onboardingCompleted = true;
    user.onboardingStep = req.body.step ?? 3;
    await user.save();
    sendSuccess(res, "Onboarding completed", { user: user.getPublicProfile() });
  } catch (err) {
    next(err);
  }
};
