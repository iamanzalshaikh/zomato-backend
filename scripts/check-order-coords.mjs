import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Order from '../src/models/order.model.ts';

const orderId = process.argv[2] || '6a3e5e813bbb513af32f2f0a';
await mongoose.connect(process.env.MONGO_URI);
const order = await Order.findById(orderId)
  .populate('restaurantId', 'restaurantName latitude longitude')
  .lean();
if (!order) {
  console.log('Order not found');
  process.exit(1);
}
const r = order.restaurantId as { latitude?: number; longitude?: number; restaurantName?: string } | null;
const ca = order.customerAddress;
console.log('orderStatus:', order.orderStatus);
console.log('restaurant:', r?.restaurantName, 'lat:', r?.latitude, 'lng:', r?.longitude);
console.log('customerAddress lat/lng:', ca?.latitude, ca?.longitude);
console.log('riderLocation:', order.riderLocation);
console.log('riderId:', order.riderId);
await mongoose.disconnect();
