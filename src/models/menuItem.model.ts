import mongoose, { Schema, Document, Model } from "mongoose";
import { FoodType, SpiceLevel } from "../types/enums.js";
import {
  addonSchema,
  nutritionalInfoSchema,
} from "./schemas/common.schemas.js";

export interface IMenuItemDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  itemName: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  price: number;
  discountedPrice?: number;
  taxPercentage: number;
  foodType: FoodType;
  spiceLevel?: SpiceLevel;
  ingredients: string[];
  nutritionalInfo?: Record<string, number>;
  addons: Array<{ name: string; price: number; isAvailable: boolean }>;
  availableQuantity: number;
  preparationTimeMinutes: number;
  isAvailable: boolean;
  isRecommended: boolean;
  averageRating: number;
  totalOrders: number;
  isDeleted: boolean;
}

const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },
    itemName: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: String,
    shortDescription: String,
    images: [String],
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    taxPercentage: { type: Number, default: 5 },
    foodType: {
      type: String,
      enum: Object.values(FoodType),
      required: true,
    },
    spiceLevel: { type: String, enum: Object.values(SpiceLevel) },
    ingredients: [String],
    nutritionalInfo: nutritionalInfoSchema,
    addons: [addonSchema],
    availableQuantity: { type: Number, default: 999 },
    preparationTimeMinutes: { type: Number, default: 15 },
    isAvailable: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "menu_items" },
);

menuItemSchema.index({ restaurantId: 1, categoryId: 1 });
menuItemSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });
menuItemSchema.index({ itemName: "text", description: "text" });

const MenuItem: Model<IMenuItemDocument> = mongoose.model<IMenuItemDocument>(
  "MenuItem",
  menuItemSchema,
);

export default MenuItem;
