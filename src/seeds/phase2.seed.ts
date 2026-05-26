import "dotenv/config";
import connectDB from "../config/db.js";
import logger from "../config/logger.js";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import MenuCategory from "../models/menuCategory.model.js";
import MenuItem from "../models/menuItem.model.js";
import Coupon from "../models/coupon.model.js";
import {
  UserRole,
  RestaurantStatus,
  FoodType,
  CouponDiscountType,
  CouponStatus,
  AccountStatus,
} from "../types/enums.js";

const seedPhase2 = async () => {
  await connectDB();

  let owner = await User.findOne({ email: "owner@foodapp.com" });
  if (!owner) {
    owner = await User.create({
      fullName: "Demo Restaurant Owner",
      email: "owner@foodapp.com",
      mobile: "9876543210",
      role: UserRole.RESTAURANT_OWNER,
      accountStatus: AccountStatus.ACTIVE,
      isEmailVerified: true,
    });
    logger.info("Created demo restaurant owner");
  }

  let restaurant = await Restaurant.findOne({ slug: "demo-biryani-house" });
  if (!restaurant) {
    restaurant = await Restaurant.create({
      ownerId: owner._id,
      restaurantName: "Demo Biryani House",
      slug: "demo-biryani-house",
      description: "Authentic biryani and kebabs",
      cuisines: ["Indian", "Mughlai"],
      location: { type: "Point", coordinates: [72.8777, 19.076] },
      latitude: 19.076,
      longitude: 72.8777,
      restaurantStatus: RestaurantStatus.APPROVED,
      isOpen: true,
      averageRating: 4.5,
      totalRatings: 120,
    });
    logger.info("Created demo restaurant");
  }

  let category = await MenuCategory.findOne({
    restaurantId: restaurant._id,
    categoryName: "Biryani",
  });
  if (!category) {
    category = await MenuCategory.create({
      restaurantId: restaurant._id,
      categoryName: "Biryani",
      sortOrder: 1,
    });
    logger.info("Created demo menu category");
  }

  const itemExists = await MenuItem.findOne({
    restaurantId: restaurant._id,
    slug: "chicken-biryani",
  });
  if (!itemExists) {
    await MenuItem.create({
      restaurantId: restaurant._id,
      categoryId: category._id,
      itemName: "Chicken Biryani",
      slug: "chicken-biryani",
      description: "Fragrant basmati rice with spiced chicken",
      price: 299,
      foodType: FoodType.NONVEG,
      isRecommended: true,
    });
    logger.info("Created demo menu item");
  }

  const couponExists = await Coupon.findOne({ couponCode: "WELCOME50" });
  if (!couponExists) {
    await Coupon.create({
      couponCode: "WELCOME50",
      title: "Welcome Offer",
      description: "Flat ₹50 off on first order",
      discountType: CouponDiscountType.FLAT,
      discountValue: 50,
      minimumOrderAmount: 199,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: CouponStatus.ACTIVE,
    });
    logger.info("Created demo coupon WELCOME50");
  }

  logger.info("Phase 2 seed completed");
  process.exit(0);
};

seedPhase2();
