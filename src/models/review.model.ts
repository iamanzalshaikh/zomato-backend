import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  riderId?: mongoose.Types.ObjectId;
  foodRating?: number;
  deliveryRating?: number;
  restaurantRating?: number;
  reviewText?: string;
  images: string[];
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
    foodRating: { type: Number, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    restaurantRating: { type: Number, min: 1, max: 5 },
    reviewText: String,
    images: [String],
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "reviews" },
);

reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ orderId: 1 }, { unique: true });

const Review: Model<IReviewDocument> = mongoose.model<IReviewDocument>(
  "Review",
  reviewSchema,
);

export default Review;
