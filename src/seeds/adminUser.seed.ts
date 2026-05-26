import "dotenv/config";
import connectDB from "../config/db.js";
import AdminUser from "../models/adminUser.model.js";
import { AdminRole } from "../types/enums.js";
import logger from "../config/logger.js";

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@foodapp.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const existing = await AdminUser.findOne({ email });

  if (existing) {
    logger.info("Admin user already exists");
    process.exit(0);
  }

  await AdminUser.create({
    email,
    password,
    name: "Super Admin",
    role: AdminRole.SUPER_ADMIN,
  });

  logger.info(`Admin seeded: ${email}`);
  process.exit(0);
};

seedAdmin();
