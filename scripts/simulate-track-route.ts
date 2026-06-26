import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Order from '../src/models/order.model.js';
import '../src/models/restaurant.model.js';
import { getRoutePolyline, isValidPoint } from '../src/services/routing.service.js';
import { getLiveRiderLocation } from '../src/services/tracking.service.js';

const orderId = process.argv[2] || '6a3e5e813bbb513af32f2f0a';
await mongoose.connect(process.env.MONGO_URI!);

const order = await Order.findById(orderId)
  .populate('restaurantId', 'restaurantName latitude longitude')
  .lean();

if (!order) {
  console.log('Order not found');
  process.exit(1);
}

const live = await getLiveRiderLocation(orderId);
const riderLoc = live
  ? { latitude: live.latitude, longitude: live.longitude }
  : order.riderLocation;

const customerLat = order.customerAddress?.latitude;
const customerLng = order.customerAddress?.longitude;
const restaurantDoc = order.restaurantId as { latitude?: number; longitude?: number } | null;

const customerPoint =
  Number.isFinite(customerLat) && Number.isFinite(customerLng)
    ? { latitude: customerLat!, longitude: customerLng! }
    : null;
const restaurantPoint =
  restaurantDoc?.latitude != null && restaurantDoc?.longitude != null
    ? { latitude: restaurantDoc.latitude, longitude: restaurantDoc.longitude }
    : null;

const customer = isValidPoint(customerPoint) ? customerPoint : null;
const restaurant = isValidPoint(restaurantPoint) ? restaurantPoint : null;
const rider = isValidPoint(riderLoc) ? riderLoc : null;

console.log('status:', order.orderStatus);
console.log('live redis:', live);
console.log('rider valid:', !!rider, rider);
console.log('customer valid:', !!customer);
console.log('restaurant valid:', !!restaurant);

let path = null;
const status = order.orderStatus;

if (['PICKED_UP', 'ON_THE_WAY'].includes(status) && rider && customer) {
  console.log('branch: rider -> customer');
  path = await getRoutePolyline({ origin: rider, destination: customer });
} else if (['RIDER_ASSIGNED', 'READY_FOR_PICKUP'].includes(status) && rider && restaurant) {
  console.log('branch: rider -> restaurant');
  path = await getRoutePolyline({ origin: rider, destination: restaurant });
} else if (restaurant && customer) {
  console.log('branch: restaurant -> customer');
  path = await getRoutePolyline({
    origin: restaurant,
    destination: customer,
    waypoints: rider ? [rider] : undefined,
  });
}

console.log('path points:', path?.length ?? 0);
await mongoose.disconnect();
