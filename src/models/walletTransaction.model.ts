import mongoose, { Schema, Document, Model } from "mongoose";
import { WalletTransactionType } from "../types/enums.js";

export interface IWalletTransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  transactionType: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  remarks?: string;
  createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    transactionType: {
      type: String,
      enum: Object.values(WalletTransactionType),
      required: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    remarks: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "wallet_transactions" },
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

const WalletTransaction: Model<IWalletTransactionDocument> =
  mongoose.model<IWalletTransactionDocument>(
    "WalletTransaction",
    walletTransactionSchema,
  );

export default WalletTransaction;
