import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import Restaurant from "../models/restaurant.model.js";
import MenuCategory from "../models/menuCategory.model.js";
import MenuItem from "../models/menuItem.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { uniqueSlug } from "../utils/slug.js";
import {
  assertRestaurantOwner,
  assertPublicRestaurant,
  getMenuForRestaurant,
} from "../services/menu.service.js";
import { getPagination, paginationMeta } from "../helpers/pagination.js";
import { publicRestaurantFilter } from "../services/restaurant.service.js";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// ─── Categories ───────────────────────────────────────────────

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { restaurantId, categoryName, categoryImage, sortOrder } = req.body;
    await assertRestaurantOwner(req.userId!, restaurantId);

    const category = await MenuCategory.create({
      restaurantId,
      categoryName,
      categoryImage,
      sortOrder: sortOrder ?? 0,
    });

    sendSuccess(res, "Category created", { category }, 201);
  } catch (err) {
    next(err);
  }
};

export const getCategoriesByRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restaurantId = paramId(req.params.restaurantId);
    const menu = await getMenuForRestaurant(restaurantId);
    sendSuccess(res, "Menu fetched", menu);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryId = paramId(req.params.categoryId);
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
      sendError(res, "Category not found", 404);
      return;
    }
    await assertRestaurantOwner(req.userId!, category.restaurantId.toString());

    Object.assign(category, req.body);
    await category.save();
    sendSuccess(res, "Category updated", { category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryId = paramId(req.params.categoryId);
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
      sendError(res, "Category not found", 404);
      return;
    }
    await assertRestaurantOwner(req.userId!, category.restaurantId.toString());

    await MenuItem.updateMany(
      { categoryId: category._id },
      { isDeleted: true, isAvailable: false },
    );
    await category.deleteOne();

    sendSuccess(res, "Category deleted");
  } catch (err) {
    next(err);
  }
};

// ─── Menu items ───────────────────────────────────────────────

export const createMenuItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { restaurantId, categoryId, itemName, ...rest } = req.body;
    await assertRestaurantOwner(req.userId!, restaurantId);

    const category = await MenuCategory.findOne({
      _id: categoryId,
      restaurantId,
    });
    if (!category) {
      sendError(res, "Category not found for this restaurant", 404);
      return;
    }

    const slug = await uniqueSlug(`${itemName}-${restaurantId}`, async (s) => {
      const found = await MenuItem.findOne({ restaurantId, slug: s });
      return !!found;
    });

    const item = await MenuItem.create({
      restaurantId,
      categoryId,
      itemName,
      slug,
      ...rest,
    });

    sendSuccess(res, "Menu item created", { item }, 201);
  } catch (err) {
    next(err);
  }
};

export const getMenuItemsByRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restaurantId = paramId(req.params.restaurantId);
    await assertPublicRestaurant(restaurantId);

    const items = await MenuItem.find({
      restaurantId,
      isDeleted: false,
    })
      .populate("categoryId", "categoryName sortOrder")
      .sort({ isRecommended: -1, itemName: 1 })
      .lean();

    sendSuccess(res, "Menu items fetched", { items });
  } catch (err) {
    next(err);
  }
};

export const getMenuItemDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = paramId(req.params.itemId);
    const item = await MenuItem.findOne({ _id: itemId, isDeleted: false })
      .populate("categoryId", "categoryName")
      .populate("restaurantId", "restaurantName slug logo isOpen averageRating")
      .lean();

    if (!item) {
      sendError(res, "Menu item not found", 404);
      return;
    }

    sendSuccess(res, "Menu item details", { item });
  } catch (err) {
    next(err);
  }
};

export const updateMenuItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = paramId(req.params.itemId);
    const item = await MenuItem.findOne({ _id: itemId, isDeleted: false });
    if (!item) {
      sendError(res, "Menu item not found", 404);
      return;
    }
    await assertRestaurantOwner(req.userId!, item.restaurantId.toString());

    const { itemName, ...rest } = req.body;
    if (itemName) {
      item.itemName = itemName;
      item.slug = await uniqueSlug(`${itemName}-${item.restaurantId}`, async (s) => {
        const found = await MenuItem.findOne({
          restaurantId: item.restaurantId,
          slug: s,
          _id: { $ne: item._id },
        });
        return !!found;
      });
    }
    Object.assign(item, rest);
    await item.save();

    sendSuccess(res, "Menu item updated", { item });
  } catch (err) {
    next(err);
  }
};

export const deleteMenuItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = paramId(req.params.itemId);
    const item = await MenuItem.findOne({ _id: itemId, isDeleted: false });
    if (!item) {
      sendError(res, "Menu item not found", 404);
      return;
    }
    await assertRestaurantOwner(req.userId!, item.restaurantId.toString());

    item.isDeleted = true;
    item.isAvailable = false;
    await item.save();

    sendSuccess(res, "Menu item deleted");
  } catch (err) {
    next(err);
  }
};

export const toggleItemAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = paramId(req.params.itemId);
    const item = await MenuItem.findOne({ _id: itemId, isDeleted: false });
    if (!item) {
      sendError(res, "Menu item not found", 404);
      return;
    }
    await assertRestaurantOwner(req.userId!, item.restaurantId.toString());

    item.isAvailable = req.body.isAvailable;
    await item.save();

    sendSuccess(res, "Availability updated", { item });
  } catch (err) {
    next(err);
  }
};

// ─── Search food (customer flow) ────────────────────────────────

export const searchMenuItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = String(req.query.q);
    const { page, limit, skip } = getPagination(
      req.query.page as string | undefined,
      req.query.limit as string | undefined,
    );

    const filter: Record<string, unknown> = {
      isDeleted: false,
      isAvailable: true,
      $or: [
        { itemName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { ingredients: { $regex: q, $options: "i" } },
      ],
    };

    if (req.query.foodType) {
      filter.foodType = req.query.foodType;
    }

    if (req.query.restaurantId) {
      filter.restaurantId = req.query.restaurantId;
    } else {
      const approvedIds = await Restaurant.find({
        ...publicRestaurantFilter(),
      }).distinct("_id");
      filter.restaurantId = { $in: approvedIds };
    }

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .populate("restaurantId", "restaurantName slug logo averageRating isOpen")
        .populate("categoryId", "categoryName")
        .skip(skip)
        .limit(limit)
        .lean(),
      MenuItem.countDocuments(filter),
    ]);

    sendSuccess(res, "Menu search results", {
      items,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (err) {
    next(err);
  }
};
