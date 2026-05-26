# Phase 6 — Menu System ✅

Base: `/api/v1/menu`

## Full customer flow (Phases 1–6)

```
1. Auth        → POST /auth/login
2. Browse      → GET /restaurants
3. Pick place  → GET /restaurants/:restaurantId
4. View menu   → GET /menu/categories/:restaurantId   ← grouped categories + items
   (alt)       → GET /menu/items/:restaurantId
5. Item detail → GET /menu/items/details/:itemId
6. Search dish → GET /menu/search?q=chicken
7. Favorite    → POST /users/favorites/:restaurantId
8. (Phase 7)   → Cart → Order
```

## APIs

### Categories (owner = JWT)

| Method | Route | Auth |
|--------|-------|------|
| POST | `/categories` | Yes |
| GET | `/categories/:restaurantId` | No |
| PATCH | `/categories/:categoryId` | Yes |
| DELETE | `/categories/:categoryId` | Yes |

### Items

| Method | Route | Auth |
|--------|-------|------|
| POST | `/items` | Yes (owner) |
| GET | `/items/:restaurantId` | No |
| GET | `/items/details/:itemId` | No |
| PATCH | `/items/:itemId` | Yes (owner) |
| DELETE | `/items/:itemId` | Yes (owner) |
| PATCH | `/items/availability/:itemId` | Yes (owner) |
| GET | `/search?q=` | No |

## Test with seed data

```bash
npm run seed:phase2
npm run dev
```

1. `GET http://localhost:5000/api/v1/restaurants` → copy `_id`
2. `GET http://localhost:5000/api/v1/menu/categories/{restaurantId}`
   - Should show **Biryani** category + **Chicken Biryani** item
3. `GET http://localhost:5000/api/v1/menu/search?q=chicken`

## Create item (owner)

```json
POST /api/v1/menu/items
Authorization: Bearer <owner-token>

{
  "restaurantId": "...",
  "categoryId": "...",
  "itemName": "Paneer Biryani",
  "price": 249,
  "foodType": "veg"
}
```

## Next: Phase 7

Cart APIs — add to cart, apply coupon, then orders.
