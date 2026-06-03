import "dotenv/config";
import connectDB from "../config/db.js";
import logger from "../config/logger.js";
import Coupon from "../models/coupon.model.js";
import Restaurant from "../models/restaurant.model.js";
import { CouponDiscountType, CouponStatus } from "../types/enums.js";

async function seedCoupons() {
  await connectDB();

  // Fetch all demo restaurants
  const restaurants = await Restaurant.find({}).select("_id restaurantName slug").lean();
  logger.info(`Found ${restaurants.length} restaurants for coupon seeding`);

  const now = new Date();
  const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  // Global coupons (applicable to ALL restaurants)
  const globalCoupons = [
    {
      couponCode: "WELCOME50",
      title: "Welcome Offer",
      description: "Get ₹50 off on your first order!",
      discountType: CouponDiscountType.FLAT,
      discountValue: 50,
      minimumOrderAmount: 199,
      usageLimit: 1000,
      validFrom: now,
      validTo: sixMonthsLater,
      applicableRestaurants: [],
      status: CouponStatus.ACTIVE,
    },
    {
      couponCode: "SAVE20",
      title: "20% Off",
      description: "Get 20% off up to ₹100 on any order",
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 20,
      minimumOrderAmount: 299,
      maximumDiscount: 100,
      usageLimit: 500,
      validFrom: now,
      validTo: sixMonthsLater,
      applicableRestaurants: [],
      status: CouponStatus.ACTIVE,
    },
    {
      couponCode: "FREEDEL",
      title: "Free Delivery",
      description: "Free delivery on orders above ₹149",
      discountType: CouponDiscountType.FLAT,
      discountValue: 40,
      minimumOrderAmount: 149,
      usageLimit: 2000,
      validFrom: now,
      validTo: sixMonthsLater,
      applicableRestaurants: [],
      status: CouponStatus.ACTIVE,
    },
  ];

  // Restaurant-specific coupons for first 3 restaurants
  const restaurantCoupons: any[] = [];

  if (restaurants.length > 0) {
    const r0 = restaurants[0];
    restaurantCoupons.push({
      couponCode: "BIRYANI30",
      title: "Biryani Special",
      description: `₹30 off on orders from ${r0.restaurantName}`,
      discountType: CouponDiscountType.FLAT,
      discountValue: 30,
      minimumOrderAmount: 249,
      usageLimit: 200,
      validFrom: now,
      validTo: sixMonthsLater,
      applicableRestaurants: [r0._id],
      status: CouponStatus.ACTIVE,
    });
  }

  if (restaurants.length > 1) {
    const r1 = restaurants[1];
    restaurantCoupons.push({
      couponCode: "PIZZA25",
      title: "Pizza Lover Deal",
      description: `25% off up to ₹80 at ${r1.restaurantName}`,
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 25,
      minimumOrderAmount: 299,
      maximumDiscount: 80,
      usageLimit: 150,
      validFrom: now,
      validTo: sixMonthsLater,
      applicableRestaurants: [r1._id],
      status: CouponStatus.ACTIVE,
    });
  }

  if (restaurants.length > 2) {
    const r2 = restaurants[2];
    restaurantCoupons.push({
      couponCode: "HEALTHY10",
      title: "Health First",
      description: `₹10 off on healthy bowls at ${r2.restaurantName}`,
      discountType: CouponDiscountType.FLAT,
      discountValue: 10,
      minimumOrderAmount: 199,
      usageLimit: 100,
      validFrom: now,
      validTo: sixMonthsLater,
      applicableRestaurants: [r2._id],
      status: CouponStatus.ACTIVE,
    });
  }

  const allCoupons = [...globalCoupons, ...restaurantCoupons];

  let created = 0;
  let skipped = 0;

  for (const coupon of allCoupons) {
    const exists = await Coupon.findOne({ couponCode: coupon.couponCode });
    if (exists) {
      // Update validity and status
      exists.validTo = coupon.validTo;
      exists.status = CouponStatus.ACTIVE;
      await exists.save();
      skipped++;
      logger.info(`Updated existing coupon: ${coupon.couponCode}`);
    } else {
      await Coupon.create(coupon);
      created++;
      logger.info(`Created coupon: ${coupon.couponCode}`);
    }
  }

  logger.info(`Coupon seed done: ${created} created, ${skipped} updated`);
  process.exit(0);
}

seedCoupons();
