# Phase 4 — Users Module ✅

Base path: `/api/v1/users` (requires JWT)

## Profile

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/profile` | Get profile |
| PATCH | `/profile` | Update name, mobile, gender, DOB, image |
| POST | `/profile-image` | Set `profileImage` URL |

## Addresses

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/address` | Add address |
| PATCH | `/address/:addressId` | Update address |
| DELETE | `/address/:addressId` | Delete address |

## Favorites

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/favorites` | List favorite restaurants |
| POST | `/favorites/:restaurantId` | Add favorite |
| DELETE | `/favorites/:restaurantId` | Remove favorite |

## Orders & wallet

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/orders?page=1&limit=10` | Order history |
| GET | `/wallet` | Balance + loyalty points |
| GET | `/wallet/transactions` | Wallet transaction history |

## Notifications

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/read/:notificationId` | Mark one read |
| PATCH | `/notifications/read-all` | Mark all read |

## Account

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/onboarding/complete` | Finish onboarding |
| DELETE | `/delete-account` | Soft-delete account |

## Legacy

`/api/v1/profile` still works (alias).

## Test favorites

After `npm run seed:phase2`, login and:

```http
POST /api/v1/users/favorites/{restaurantId}
Authorization: Bearer <token>
```

Use restaurant id from MongoDB `restaurants` collection.

## Next: Phase 5

Restaurant APIs — CRUD, nearby, search.
