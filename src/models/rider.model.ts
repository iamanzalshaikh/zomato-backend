import mongoose, { Schema, Document, Model } from "mongoose";
import {
  VehicleType,
  RiderAvailability,
  VerificationStatus,
} from "../types/enums.js";
import { geoPointSchema, bankDetailsSchema } from "./schemas/common.schemas.js";

export interface IRiderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  riderCode: string;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  drivingLicense?: string;
  aadhaarCard?: string;
  profileImage?: string;
  currentLocation?: { type: string; coordinates: number[] };
  onlineStatus: boolean;
  availabilityStatus: RiderAvailability;
  currentOrderId?: mongoose.Types.ObjectId;
  averageRating: number;
  totalDeliveries: number;
  totalEarnings: number;
  todayEarnings: number;
  bankAccountDetails?: Record<string, string>;
  verificationStatus: VerificationStatus;
  lastLocationUpdatedAt?: Date;
}

const riderSchema = new Schema<IRiderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    riderCode: { type: String, required: true, unique: true },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      default: VehicleType.BIKE,
    },
    vehicleNumber: String,
    drivingLicense: String,
    aadhaarCard: String,
    profileImage: String,
    currentLocation: geoPointSchema,
    onlineStatus: { type: Boolean, default: false },
    availabilityStatus: {
      type: String,
      enum: Object.values(RiderAvailability),
      default: RiderAvailability.OFFLINE,
    },
    currentOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
    averageRating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    bankAccountDetails: bankDetailsSchema,
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    lastLocationUpdatedAt: Date,
  },
  { timestamps: true, collection: "riders" },
);

riderSchema.index({ currentLocation: "2dsphere" });
riderSchema.index({ availabilityStatus: 1, onlineStatus: 1 });

const Rider: Model<IRiderDocument> = mongoose.model<IRiderDocument>("Rider", riderSchema);

export default Rider;
