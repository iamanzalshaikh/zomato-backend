import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuCategoryDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryName: string;
  categoryImage?: string;
  sortOrder: number;
  isActive: boolean;
}

const menuCategorySchema = new Schema<IMenuCategoryDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryName: { type: String, required: true, trim: true },
    categoryImage: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "menu_categories" },
);

menuCategorySchema.index({ restaurantId: 1, sortOrder: 1 });

const MenuCategory: Model<IMenuCategoryDocument> = mongoose.model<IMenuCategoryDocument>(
  "MenuCategory",
  menuCategorySchema,
);

export default MenuCategory;
