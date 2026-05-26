# Phase 5 — Restaurants Module ✅

Base: `/api/v1/restaurants`

## Zomato-style flow (Phases 1–5)

```
1. Register/Login     → POST /auth/register or /auth/login
2. Browse restaurants → GET /restaurants
3. Nearby           → GET /restaurants/nearby?lat=&lng=
4. Search           → GET /restaurants/search?q=biryani
5. View details     → GET /restaurants/:restaurantId
6. Favorite         → POST /users/favorites/:restaurantId
7. (Phase 6) Menu   → GET /menu/items/:restaurantId
```

**Restaurant partner flow:**

```
1. Login as user
2. POST /restaurants          → creates listing (status: pending)
3. PATCH /restaurants/:id/approve-dev   → dev only, sets approved
4. PATCH /restaurants/status/:id        → isOpen: true
```

## APIs

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | No | List approved restaurants (filters, sort) |
| GET | `/nearby` | No | Geo nearby (`lat`, `lng`, `radiusKm`) |
| GET | `/search` | No | Search by name/cuisine (`q`) |
| GET | `/:restaurantId` | Optional | Restaurant details |
| POST | `/` | Yes | Register restaurant (owner) |
| PATCH | `/:restaurantId` | Yes | Update (owner only) |
| DELETE | `/:restaurantId` | Yes | Soft delete (owner) |
| PATCH | `/status/:restaurantId` | Yes | Open/close (owner, must be approved) |
| GET | `/analytics/:restaurantId` | Yes | Basic stats (owner) |
| PATCH | `/:restaurantId/approve-dev` | Yes | Dev: approve restaurant |

## List query params

`?page=1&limit=10&sort=rating|deliveryTime|distance|newest&lat=&lng=&cuisine=Indian&isOpen=true&minRating=4`

## Test the flow

```bash
npm run seed:phase2   # Demo Biryani House (approved)
npm run dev
```

1. `GET http://localhost:5000/api/v1/restaurants`
2. `GET http://localhost:5000/api/v1/restaurants/nearby?lat=19.076&lng=72.8777`
3. `GET http://localhost:5000/api/v1/restaurants/search?q=biryani`
4. Copy `_id` from response → `GET /api/v1/restaurants/{id}`

## Next: Phase 6

Menu categories & items APIs.
