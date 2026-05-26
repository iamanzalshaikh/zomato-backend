# Phase 7 — Cart System ✅

Base: `/api/v1/cart` (all routes require JWT)

## Flow (Phases 1–7)

```
Login → Browse → Menu → Cart → Coupon → Order (Phase 8) → Razorpay if ONLINE (Phase 9)
```

## APIs

| Method | Route | Body |
|--------|-------|------|
| GET | `/` | — |
| POST | `/add` | `restaurantId`, `menuItemId`, `quantity`, `addons?` |
| PATCH | `/update/:itemId` | `quantity` |
| DELETE | `/remove/:itemId` | — |
| DELETE | `/clear` | — |
| POST | `/apply-coupon` | `couponCode` |
| DELETE | `/remove-coupon` | — |

## Price breakdown (auto-calculated)

- `subtotal` — sum of line items
- `taxAmount` — per-item tax %
- `deliveryFee` — flat fee (see `constants`)
- `platformFee` — % of subtotal (capped)
- `couponDiscount` — from `WELCOME50` seed coupon
- `grandTotal` — final amount

## Test flow

```bash
npm run seed:phase2
npm run dev
```

1. `POST /auth/login` or register → token  
2. `GET /restaurants` → `restaurantId`  
3. `GET /menu/categories/{restaurantId}` → `menuItemId` from item `_id`  
4. `POST /cart/add`:

```json
{
  "restaurantId": "<id>",
  "menuItemId": "<id>",
  "quantity": 2,
  "addons": []
}
```

5. `GET /cart` — see totals  
6. `POST /cart/apply-coupon` → `{ "couponCode": "WELCOME50" }`  
7. `itemId` in cart response = subdocument `_id` under `items[]` for update/remove  

## Rules

- One cart per user  
- Adding from a **different restaurant** clears cart and switches restaurant  
- Same item + same addons → quantity merged  

## Next: Phase 8

`POST /orders/create` — place order from cart.
