# Phase 9 — Payments (Razorpay) ✅

Base: `/api/v1/payments`

Aligned with `endpoints.md`, Phase 8 `ONLINE` orders, and mobile Razorpay Checkout flow.

## Full ONLINE payment flow

```
1. Build cart → POST /orders/create  { "paymentMethod": "ONLINE", ... }
   → orderStatus: PENDING, paymentStatus: PENDING

2. POST /payments/create-order  { "orderId": "..." }
   → razorpayOrderId, keyId, amount (INR), paymentId

3. Mobile: Razorpay Checkout (react-native-razorpay) with keyId + razorpayOrderId

4. POST /payments/verify
   {
     "orderId": "...",
     "razorpay_order_id": "...",
     "razorpay_payment_id": "...",
     "razorpay_signature": "..."
   }
   → orderStatus: CONFIRMED, paymentStatus: CAPTURED

5. (Backup) Razorpay webhook POST /api/v1/payments/webhook
```

## APIs

| Method | Route | Auth | Body |
|--------|-------|------|------|
| POST | `/create-order` | JWT | `{ "orderId" }` |
| POST | `/verify` | JWT | `orderId` + Razorpay ids + signature |
| POST | `/webhook` | Razorpay signature | Raw JSON (mounted in `app.ts`) |
| POST | `/refund` | JWT | `{ "paymentId", "amount?", "reason?" }` |
| GET | `/:paymentId` | JWT | — |
| POST | `/wallet/add-money` | JWT | 501 stub (use `/users/wallet` for balance) |

## Environment (`.env`)

```env
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Get test keys from [Razorpay Dashboard](https://dashboard.razorpay.com/) → Test mode.

## Alignment fixes (Phase 8 + 9)

| Rule | Behavior |
|------|----------|
| ONLINE order at create | Stays `PENDING` until verify/webhook |
| Coupon `WELCOME50` | `usedCount` increments **after payment**, not at order create |
| Restaurant confirm | Cannot `CONFIRMED` a `PENDING` unpaid ONLINE order |
| Payable amount | `grandTotal - walletDeduction` (partial wallet supported) |
| Zero payable | Auto-confirms without Razorpay (wallet covered all) |
| `order.paymentId` | Set when payment captured |
| `order.appliedCouponId` | Stored on order for post-payment coupon increment |

## Test (test mode)

```bash
npm run seed:phase2
npm run dev
```

1. Login as customer  
2. Cart + address (Phase 7–8)  
3. `POST /orders/create` with `"paymentMethod": "ONLINE"`  
4. `POST /payments/create-order` with `orderId`  
5. Pay in Razorpay test checkout (UPI test / test card)  
6. `POST /payments/verify` with returned ids + signature  
7. `GET /orders/:orderId` → `CONFIRMED`  

## Webhook (local)

Use ngrok or similar → point Razorpay webhook to:

`POST https://your-host/api/v1/payments/webhook`

Events: `payment.captured`, `payment.failed`, `refund.processed`

## COD / WALLET

Unchanged — no Razorpay. Only `ONLINE` uses this module.

## Next: Phase 11

Socket.io — push `order_confirmed` after payment instead of polling.
