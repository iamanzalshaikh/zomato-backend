import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRiderLocationDocument extends Document {
  riderId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  recordedAt: Date;
}

const riderLocationSchema = new Schema<IRiderLocationDocument>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "Rider", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: Number,
    heading: Number,
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false, collection: "rider_locations" },
);

riderLocationSchema.index({ riderId: 1, recordedAt: -1 });
riderLocationSchema.index({ orderId: 1, recordedAt: -1 });

const RiderLocation: Model<IRiderLocationDocument> = mongoose.model<IRiderLocationDocument>(
  "RiderLocation",
  riderLocationSchema,
);

export default RiderLocation;
