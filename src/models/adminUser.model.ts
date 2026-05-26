import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { AdminRole } from "../types/enums.js";

export interface IAdminUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  comparePassword(entered: string): Promise<boolean>;
}

const adminUserSchema = new Schema<IAdminUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "admin_users" },
);

adminUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminUserSchema.methods.comparePassword = async function (
  entered: string,
): Promise<boolean> {
  return bcrypt.compare(entered, this.password);
};

const AdminUser: Model<IAdminUserDocument> = mongoose.model<IAdminUserDocument>(
  "AdminUser",
  adminUserSchema,
);

export default AdminUser;
