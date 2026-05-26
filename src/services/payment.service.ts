import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Coupon from "../models/coupon.model.js";
import { AppError } from "../utils/AppError.js";
import {
  GatewayPaymentMethod,
  OrderStatus,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
} from "../types/enums.js";
import {
  createRazorpayOrder,
  createRazorpayRefund,
  isRazorpayConfigured,
  rupeesToPaise,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./razorpay.service.js";
import { env } from "../config/env.js";
import { idString } from "./order.service.js";
import { broadcastOrderEvent, emitOrderStatusChange } from "./socket.service.js";
import { SocketEvents } from "../types/socket.events.js";

export function getOrderPayableAmount(order: InstanceType<typeof Order>): number {
  return Math.max(
    0,
    Math.round((order.grandTotal - order.walletDeduction) * 100) / 100,
  );
}

async function incrementCouponUsage(couponId?: string) {
  if (!couponId) return;
  const coupon = await Coupon.findById(couponId);
  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }
}

export async function confirmOrderAfterPayment(
  order: InstanceType<typeof Order>,
  payment: InstanceType<typeof Payment>,
  updatedBy = "payment",
) {
  if (order.orderStatus === OrderStatus.CONFIRMED) {
    return order;
  }

  if (order.orderStatus !== OrderStatus.PENDING) {
    throw new AppError("Order cannot be confirmed in current state", 400);
  }

  order.orderStatus = OrderStatus.CONFIRMED;
  order.paymentStatus = PaymentStatus.CAPTURED;
  order.paymentId = payment._id;
  order.acceptedAt = new Date();
  order.timelineLogs.push({
    status: OrderStatus.CONFIRMED,
    updatedBy,
    timestamp: new Date(),
  });

  await incrementCouponUsage(order.appliedCouponId?.toString());
  await order.save();
  broadcastOrderEvent(order, SocketEvents.ORDER_CONFIRMED);
  emitOrderStatusChange(order);
  return order;
}

export async function createPaymentOrder(userId: string, orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  if (idString(order.customerId) !== userId) {
    throw new AppError("You do not own this order", 403);
  }
  if (order.paymentMethod !== PaymentMethod.ONLINE) {
    throw new AppError("This order does not use online payment", 400);
  }
  if (order.orderStatus !== OrderStatus.PENDING) {
    throw new AppError("Order is not awaiting payment", 400);
  }

  const payable = getOrderPayableAmount(order);

  if (payable <= 0) {
    let payment = await Payment.findOne({
      orderId: order._id,
      paymentStatus: PaymentStatus.PENDING,
    });
    if (!payment) {
      payment = await Payment.create({
        orderId: order._id,
        userId,
        gateway: PaymentGateway.RAZORPAY,
        amount: 0,
        currency: "INR",
        paymentMethod: GatewayPaymentMethod.WALLET,
        paymentStatus: PaymentStatus.CAPTURED,
        paidAt: new Date(),
        transactionId: `WALLET-${order.orderNumber}`,
      });
    } else {
      payment.paymentStatus = PaymentStatus.CAPTURED;
      payment.paidAt = new Date();
      await payment.save();
    }
    await confirmOrderAfterPayment(order, payment, userId);
    return {
      payment,
      order,
      razorpay: null,
      keyId: env.RAZORPAY_KEY_ID ?? null,
      autoConfirmed: true,
    };
  }

  if (!isRazorpayConfigured()) {
    throw new AppError("Razorpay is not configured", 503);
  }

  let payment = await Payment.findOne({
    orderId: order._id,
    paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.AUTHORIZED] },
  });

  if (payment?.gatewayOrderId) {
    return {
      payment,
      order,
      razorpay: {
        id: payment.gatewayOrderId,
        amount: rupeesToPaise(payment.amount),
        currency: payment.currency,
      },
      keyId: env.RAZORPAY_KEY_ID,
      autoConfirmed: false,
    };
  }

  const razorpayOrder = await createRazorpayOrder({
    amountPaise: rupeesToPaise(payable),
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      userId,
    },
  });

  if (payment) {
    payment.amount = payable;
    payment.gatewayOrderId = razorpayOrder.id;
    payment.gatewayResponse = razorpayOrder as unknown as Record<string, unknown>;
    payment.retryCount += 1;
    await payment.save();
  } else {
    payment = await Payment.create({
      orderId: order._id,
      userId,
      gateway: PaymentGateway.RAZORPAY,
      gatewayOrderId: razorpayOrder.id,
      amount: payable,
      currency: "INR",
      paymentMethod: GatewayPaymentMethod.UPI,
      paymentStatus: PaymentStatus.PENDING,
      gatewayResponse: razorpayOrder as unknown as Record<string, unknown>,
    });
  }

  return {
    payment,
    order,
    razorpay: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
    keyId: env.RAZORPAY_KEY_ID,
    autoConfirmed: false,
  };
}

export async function verifyPayment(
  userId: string,
  input: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
) {
  const order = await Order.findById(input.orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  if (idString(order.customerId) !== userId) {
    throw new AppError("You do not own this order", 403);
  }

  const payment = await Payment.findOne({
    orderId: order._id,
    gatewayOrderId: input.razorpay_order_id,
  });
  if (!payment) {
    throw new AppError("Payment record not found for this order", 404);
  }

  if (payment.paymentStatus === PaymentStatus.CAPTURED) {
    return { payment, order, alreadyVerified: true };
  }

  const valid = verifyPaymentSignature(
    input.razorpay_order_id,
    input.razorpay_payment_id,
    input.razorpay_signature,
  );
  if (!valid) {
    payment.paymentStatus = PaymentStatus.FAILED;
    await payment.save();
    throw new AppError("Invalid payment signature", 400);
  }

  payment.gatewayPaymentId = input.razorpay_payment_id;
  payment.paymentStatus = PaymentStatus.CAPTURED;
  payment.paidAt = new Date();
  payment.transactionId = input.razorpay_payment_id;
  await payment.save();

  const confirmed = await confirmOrderAfterPayment(order, payment, userId);
  return { payment, order: confirmed, alreadyVerified: false };
}

export async function handlePaymentWebhook(
  rawBody: Buffer,
  signature: string | undefined,
) {
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const payload = JSON.parse(rawBody.toString("utf8")) as {
    event: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      refund?: { entity?: Record<string, unknown> };
    };
  };

  const event = payload.event;

  if (event === "payment.captured") {
    const entity = payload.payload?.payment?.entity;
    if (!entity) return { handled: false };

    const gatewayOrderId = entity.order_id as string | undefined;
    const gatewayPaymentId = entity.id as string | undefined;
    if (!gatewayOrderId || !gatewayPaymentId) return { handled: false };

    const payment = await Payment.findOne({ gatewayOrderId });
    if (!payment) return { handled: false };

    payment.webhookPayload = payload as unknown as Record<string, unknown>;
    if (payment.paymentStatus !== PaymentStatus.CAPTURED) {
      payment.gatewayPaymentId = gatewayPaymentId;
      payment.paymentStatus = PaymentStatus.CAPTURED;
      payment.paidAt = new Date();
      payment.transactionId = gatewayPaymentId;
      await payment.save();

      const order = await Order.findById(payment.orderId);
      if (order && order.orderStatus === OrderStatus.PENDING) {
        await confirmOrderAfterPayment(order, payment, "webhook");
      }
    }
    return { handled: true, event };
  }

  if (event === "payment.failed") {
    const entity = payload.payload?.payment?.entity;
    const gatewayOrderId = entity?.order_id as string | undefined;
    if (!gatewayOrderId) return { handled: false };

    const payment = await Payment.findOne({ gatewayOrderId });
    if (payment && payment.paymentStatus === PaymentStatus.PENDING) {
      payment.paymentStatus = PaymentStatus.FAILED;
      payment.webhookPayload = payload as unknown as Record<string, unknown>;
      await payment.save();
    }
    return { handled: true, event };
  }

  if (event === "refund.processed") {
    const entity = payload.payload?.refund?.entity;
    const gatewayPaymentId = entity?.payment_id as string | undefined;
    if (!gatewayPaymentId) return { handled: false };

    const payment = await Payment.findOne({ gatewayPaymentId });
    if (payment) {
      payment.paymentStatus = PaymentStatus.REFUNDED;
      payment.refundAmount = (entity?.amount as number) / 100 || payment.amount;
      payment.refundedAt = new Date();
      payment.webhookPayload = payload as unknown as Record<string, unknown>;
      await payment.save();
    }
    return { handled: true, event };
  }

  return { handled: false, event };
}

export async function getPaymentById(userId: string, paymentId: string) {
  const payment = await Payment.findById(paymentId).populate(
    "orderId",
    "orderNumber orderStatus grandTotal",
  );
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }
  if (payment.userId.toString() !== userId) {
    throw new AppError("You do not have access to this payment", 403);
  }
  return payment;
}

export async function initiateRefund(
  userId: string,
  paymentId: string,
  reason?: string,
  amount?: number,
) {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }
  if (payment.userId.toString() !== userId) {
    throw new AppError("You do not have access to this payment", 403);
  }
  if (payment.paymentStatus !== PaymentStatus.CAPTURED) {
    throw new AppError("Only captured payments can be refunded", 400);
  }
  if (!payment.gatewayPaymentId) {
    throw new AppError("No gateway payment id for refund", 400);
  }

  const refundAmount = amount ?? payment.amount;
  if (refundAmount <= 0 || refundAmount > payment.amount) {
    throw new AppError("Invalid refund amount", 400);
  }

  const refund = await createRazorpayRefund(
    payment.gatewayPaymentId,
    rupeesToPaise(refundAmount),
    { reason: reason ?? "customer_request" },
  );

  payment.refundAmount = refundAmount;
  payment.refundReason = reason;
  payment.paymentStatus = PaymentStatus.REFUNDED;
  payment.refundedAt = new Date();
  payment.gatewayResponse = {
    ...(payment.gatewayResponse ?? {}),
    refund,
  };
  await payment.save();

  const order = await Order.findById(payment.orderId);
  if (order) {
    order.paymentStatus = PaymentStatus.REFUNDED;
    order.refundAmount = refundAmount;
    await order.save();
  }

  return { payment, refund };
}
