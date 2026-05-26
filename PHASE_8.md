# Phase 8 — Order Engine ✅

Base: `/api/v1/orders` (all routes require JWT)

## Flow (Phases 1–8)

```
Login → Restaurants → Menu → Cart → Apply coupon → Add address → Place order → Track
```

## APIs

| Method | Route | Body / notes |
|--------|-------|----------------|
| POST | `/create` | `deliveryAddressId`, `paymentMethod` (`COD` \| `ONLINE` \| `WALLET`), `couponId?`, `deliveryInstructions?`, `useWallet?` |
| GET | `/:orderId` | Order details (customer, owner, or assigned rider) |
| GET | `/user/history` | Paginated order history |
| GET | `/active` | In-progress orders |
| GET | `/track/:orderId` | Timeline + ETA + rider location |
| PATCH | `/cancel/:orderId` | `{ "reason"? }` — customer only, before preparing |
| PATCH | `/status/:orderId` | `{ "status", "cancellationReason"? }` — lifecycle updates |
| PATCH | `/assign-rider/:orderId` | `{ "riderId"? }` — when status is `READY_FOR_PICKUP` |
| POST | `/verify-delivery-otp` | `{ "orderId", "otp" }` — 4-digit OTP from order |
| POST | `/refund-request` | `{ "orderId", "description" }` — delivered orders only |
| GET | `/restaurant/:restaurantId` | Owner: list restaurant orders (`?status=`) |

## Order lifecycle

```
PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → RIDER_ASSIGNED
  → PICKED_UP → ON_THE_WAY → DELIVERED
```

Cancelled from `PENDING`, `CONFIRMED`, or `PREPARING` (customer).

## Payment behaviour (Phase 8)

| Method | On create |
|--------|-----------|
| `COD` | `CONFIRMED`, payment `PENDING` |
| `WALLET` | `CONFIRMED`, wallet debited, payment `CAPTURED` |
| `ONLINE` | `PENDING` until `POST /payments/verify` (Phase 9) |

## Test flow

```bash
npm run seed:phase2
npm run dev
```

1. Login as customer → token  
2. Add address: `POST /users/address` with `latitude`, `longitude`, `fullAddress`  
3. Build cart (Phase 7): add items, optional `WELCOME50`  
4. Place order:

```json
POST /api/v1/orders/create
{
  "deliveryAddressId": "<address _id>",
  "paymentMethod": "COD",
  "deliveryInstructions": "Ring the bell"
}
```

5. `GET /orders/active` — see active order  
6. `GET /orders/track/:orderId` — timeline  
7. Owner updates status: `PATCH /orders/status/:orderId` with `{ "status": "PREPARING" }`  
8. Cart is cleared automatically after successful create  

## Rules

- Cart must not be empty; subtotal must meet restaurant `minimumOrderAmount`  
- Restaurant must be open and approved  
- Coupon `usedCount` incremented when order uses cart coupon  
- `deliveryOtp` returned on order — customer verifies at delivery  

## Next: Phase 11

Sockets for live order updates (Phase 9 payments done — see `PHASE_9.md`).
