# Phase 15 — Analytics System ✅

Base: `/api/v1/analytics` — **admin JWT required**

Restaurant owners use existing: `GET /api/v1/restaurants/analytics/:restaurantId` (owner token).

## Query params (all analytics routes)

| Param | Default | Example |
|-------|---------|---------|
| `days` | `30` | `?days=7` |
| `from` | — | `?from=2026-05-01` |
| `to` | today | `?to=2026-05-22` |

## Admin APIs

| Method | Route | Returns |
|--------|-------|---------|
| GET | `/summary` | Sales + orders + users + delivery in one call |
| GET | `/sales` | Revenue, AOV, revenue by day, payment mix, top restaurants |
| GET | `/orders` | By status, by day, cancellation rate, orders today |
| GET | `/users` | Total users, new signups, by role, growth by day |
| GET | `/delivery` | Riders online, deliveries, avg delivery time, top riders |

## Restaurant owner analytics

`GET /api/v1/restaurants/analytics/:restaurantId`

- Total / completed orders, revenue
- Rating, orders by status
- Last 30 days orders + revenue chart data

## Test

```bash
npm run seed:admin
npm run dev
```

1. `POST /admin/login` → admin token  
2. `GET /analytics/summary?days=30`  
3. `GET /analytics/sales`  
4. Owner: `GET /restaurants/analytics/{restaurantId}` with owner JWT  

## Notes

- Revenue counts **DELIVERED** orders only (sales truth).  
- Platform fees / restaurant settlement not split here (future finance module).  

## Next: Phase 16

See `PHASE_16.md` (Redis, BullMQ, socket adapter, live tracking).
