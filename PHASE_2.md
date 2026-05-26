# Phase 2 — Database Implementation ✅

All 15 collections from `database.md` + enums + indexes + seed data.

## Collections

| Collection | Model file |
|------------|------------|
| users | `user.model.ts` |
| restaurants | `restaurant.model.ts` |
| menu_categories | `menuCategory.model.ts` |
| menu_items | `menuItem.model.ts` |
| carts | `cart.model.ts` |
| orders | `order.model.ts` |
| payments | `payment.model.ts` |
| riders | `rider.model.ts` |
| rider_locations | `riderLocation.model.ts` |
| wallet_transactions | `walletTransaction.model.ts` |
| coupons | `coupon.model.ts` |
| reviews | `review.model.ts` |
| notifications | `notification.model.ts` |
| support_tickets | `supportTicket.model.ts` |
| audit_logs | `auditLog.model.ts` |
| admin_users | `adminUser.model.ts` |

## Enums

All enums live in `src/types/enums.ts` (roles, order status, payment status, etc.).

## User field names (aligned with database.md)

- `fullName`, `mobile`, `profileImage` (API also accepts legacy `name`, `phone`, `avatarUrl`)

## Seed demo data

```bash
npm run seed:phase2
```

Creates: demo restaurant owner, restaurant, menu category, menu item, coupon `WELCOME50`.

## Verify

```bash
npm run typecheck
npm run build
npm run dev
# GET http://localhost:5000/api/v1/system/status
```

## Next: Phase 3

Authentication APIs per `endpoints.md` (refresh token, password reset, etc.).
