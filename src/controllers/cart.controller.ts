import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  getUserCart,
  getOrCreateCart,
  getMenuItemForCart,
  ensureRestaurantForCart,
  recalculateCart,
  lineItemTotal,
  validateCoupon,
} from "../services/cart.service.js";
function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// GET /cart
export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await getUserCart(req.userId!);
    if (!cart || cart.items.length === 0) {
      sendSuccess(res, "Cart is empty", { cart: null });
      return;
    }
    sendSuccess(res, "Cart fetched", { cart });
  } catch (err) {
    next(err);
  }
};

// POST /cart/add
export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { restaurantId, menuItemId, quantity, addons, specialInstructions } =
      req.body;

    await ensureRestaurantForCart(restaurantId);
    const menuItem = await getMenuItemForCart(menuItemId);

    if (menuItem.restaurantId.toString() !== restaurantId) {
      sendError(res, "Menu item does not belong to this restaurant", 400);
      return;
    }

    const unitPrice = menuItem.discountedPrice ?? menuItem.price;
    const cart = await getOrCreateCart(req.userId!, restaurantId);

    const addonList = addons ?? [];
    const existing = cart.items.find(
      (line) =>
        line.menuItemId.toString() === menuItemId &&
        JSON.stringify(line.addons ?? []) === JSON.stringify(addonList),
    );

    if (existing) {
      existing.quantity += quantity;
      existing.total = lineItemTotal(unitPrice, existing.quantity, addonList);
      if (specialInstructions) existing.specialInstructions = specialInstructions;
    } else {
      cart.items.push({
        menuItemId: menuItem._id,
        itemName: menuItem.itemName,
        quantity,
        price: unitPrice,
        addons: addonList,
        specialInstructions,
        total: lineItemTotal(unitPrice, quantity, addonList),
      });
    }

    await recalculateCart(cart);
    const populated = await getUserCart(req.userId!);

    sendSuccess(res, "Item added to cart", { cart: populated }, 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /cart/update/:itemId
export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = paramId(req.params.itemId);
    const cart = await getUserCart(req.userId!);
    if (!cart) {
      sendError(res, "Cart is empty", 404);
      return;
    }

    const line = cart.items.id(itemId);
    if (!line) {
      sendError(res, "Cart item not found", 404);
      return;
    }

    line.quantity = req.body.quantity;
    const addonList = (line.addons ?? []) as { name: string; price: number }[];
    line.total = lineItemTotal(line.price, line.quantity, addonList);

    await recalculateCart(cart);
    const populated = await getUserCart(req.userId!);

    sendSuccess(res, "Cart item updated", { cart: populated });
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/remove/:itemId
export const removeCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = paramId(req.params.itemId);
    const cart = await getUserCart(req.userId!);
    if (!cart) {
      sendError(res, "Cart is empty", 404);
      return;
    }

    const line = cart.items.id(itemId);
    if (!line) {
      sendError(res, "Cart item not found", 404);
      return;
    }

    line.deleteOne();

    if (cart.items.length === 0) {
      cart.appliedCouponId = undefined;
    }

    await recalculateCart(cart);
    const populated = await getUserCart(req.userId!);

    sendSuccess(res, "Item removed from cart", { cart: populated });
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/clear
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await getUserCart(req.userId!);
    if (!cart) {
      sendSuccess(res, "Cart already empty");
      return;
    }

    cart.set("items", []);
    cart.appliedCouponId = undefined;
    await recalculateCart(cart);

    sendSuccess(res, "Cart cleared", { cart });
  } catch (err) {
    next(err);
  }
};

// POST /cart/apply-coupon
export const applyCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await getUserCart(req.userId!);
    if (!cart || cart.items.length === 0) {
      sendError(res, "Cart is empty", 400);
      return;
    }

    const coupon = await validateCoupon(
      req.body.couponCode,
      cart.restaurantId.toString(),
      cart.subtotal,
    );

    cart.appliedCouponId = coupon._id;
    await recalculateCart(cart);
    const populated = await getUserCart(req.userId!);

    sendSuccess(res, "Coupon applied", { cart: populated });
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/remove-coupon
export const removeCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await getUserCart(req.userId!);
    if (!cart) {
      sendError(res, "Cart is empty", 404);
      return;
    }

    cart.appliedCouponId = undefined;
    await recalculateCart(cart);
    const populated = await getUserCart(req.userId!);

    sendSuccess(res, "Coupon removed", { cart: populated });
  } catch (err) {
    next(err);
  }
};

// PATCH /cart/preferences
export const updateCartPreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { generalNote, dontSendCutlery } = req.body;
    const cart = await getUserCart(req.userId!);
    if (!cart) {
      sendError(res, "Cart is empty", 404);
      return;
    }

    if (generalNote !== undefined) cart.generalNote = generalNote;
    if (dontSendCutlery !== undefined) cart.dontSendCutlery = dontSendCutlery;

    await recalculateCart(cart);
    const populated = await getUserCart(req.userId!);

    sendSuccess(res, "Cart preferences updated", { cart: populated });
  } catch (err) {
    next(err);
  }
};
