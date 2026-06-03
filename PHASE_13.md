# Phase 13 — Admin Panel ✅

Base: `/api/v1/admin`

Separate **admin JWT** (`JWT_ADMIN_ACCESS_SECRET`) — not the customer token.

## Setup admin user

```bash
npm run seed:admin
```

Default (override in `.env`):

- Email: `admin@foodapp.com`
- Password: `Admin@123`

```env
ADMIN_EMAIL=admin@foodapp.com
ADMIN_PASSWORD=Admin@123
```

## Login

```json
POST /api/v1/admin/login

{
  "email": "admin@foodapp.com",
  "password": "Admin@123"
}
```

Response: `accessToken`, `refreshToken`, `admin` profile.

Use header: `Authorization: Bearer <admin-accessToken>`

## Dashboard

`GET /admin/dashboard`

Returns counts: users, restaurants (pending), riders (pending), orders (today/active/delivered), revenue (delivered orders sum), open refund tickets.

## User management

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/users` | `?page&limit&role&accountStatus` |
| PATCH | `/users/block/:userId` | Sets `blocked` |
| PATCH | `/users/unblock/:userId` | Sets `active` |

## Restaurant approval

| Method | Route |
|--------|-------|
| GET | `/restaurants` | `?status=pending` |
| PATCH | `/restaurants/approve/:restaurantId` | → `approved`, `isOpen: true` |
| PATCH | `/restaurants/reject/:restaurantId` | `{ "reason"? }` → `rejected` |

## Rider approval

| Method | Route |
|--------|-------|
| GET | `/riders` | `?verificationStatus=pending` |
| PATCH | `/riders/approve/:riderId` | |
| PATCH | `/riders/reject/:riderId` | `{ "reason"? }` |

## Orders

| Method | Route |
|--------|-------|
| GET | `/orders` | `?orderStatus=&page=&limit=` |
| PATCH | `/orders/cancel/:orderId` | Admin cancel + socket/notification |

## Refunds

| Method | Route |
|--------|-------|
| GET | `/refunds` | Open `REFUND` support tickets |

Process actual Razorpay refund via `POST /payments/refund` (customer) or extend admin refund action later.

## Coupon Management

Admin-only endpoints to manage promotional vouchers (e.g., WELCOME50, VIP Vouchers, District Vouchers):

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/coupons` | Create a new coupon with validation constraints |
| DELETE | `/api/v1/coupons/:couponId` | Revoke/delete an active coupon from the database |

Requires header: `Authorization: Bearer <admin-accessToken>`

## Not in MVP

| Feature | Status |
|---------|--------|
| Banner management | `GET /admin/banners` → 501 |
| Admin refresh token route | Use login again for now |

## Production flow

1. Owner registers restaurant → `pending`  
2. Admin `PATCH /restaurants/approve/:id`  
3. Rider registers → `pending` (production)  
4. Admin `PATCH /riders/approve/:id`  
5. Riders can go online and accept orders  

Dev shortcuts (`approve-dev`) still work in non-production.

## Next: Phase 14

Support tickets API (customer create/list, admin resolve).
