# Phase 17 — Search System ✅

Base: `/api/v1/search` — **public** (no JWT)

Legacy routes still work:
- `GET /restaurants/search?q=`
- `GET /menu/search?q=`

## APIs

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/search?q=burger` | Global: restaurants + foods + optional nearby |
| GET | `/search/restaurants?q=kfc` | Restaurants only |
| GET | `/search/foods?q=pizza` | Menu items only |
| GET | `/search/trending` | Top searches (Redis sorted set) |

## Query params

**Global** `GET /search`

| Param | Required | Notes |
|-------|----------|--------|
| `q` | Yes | Search term |
| `lat`, `lng` | No | If set, includes nearby restaurants block |
| `radiusKm` | No | Default `5` when lat/lng provided |
| `page`, `limit` | No | Reserved for future; global uses fixed preview sizes |

**Foods** `GET /search/foods`

| Param | Notes |
|-------|--------|
| `restaurantId` | Filter to one restaurant |
| `foodType` | `veg` \| `nonveg` \| `egg` |

**Trending** `GET /search/trending`

| Param | Default |
|-------|---------|
| `limit` | `10` (max 50) |

## Trending searches

- Each search on `/search`, `/search/restaurants`, `/search/foods` increments a Redis score (`search:trending:scores`).
- Terms normalized (lowercase, min 2 chars).
- Requires Redis for trending; returns `[]` if Redis is down.

## Caching

- Global search results cached **5 min** (same `CACHE_TTL_SECONDS` as Phase 16).
- Restaurant-only search uses existing restaurant cache from Phase 16.

## Test

```bash
npm run seed:phase2
npm run dev
```

```http
GET /api/v1/search?q=biryani
GET /api/v1/search?q=pizza&lat=12.9716&lng=77.5946
GET /api/v1/search/restaurants?q=demo
GET /api/v1/search/foods?q=chicken
GET /api/v1/search/trending
```

Repeat searches → `trending` should list popular terms.

## Next: Phase 18

See `PHASE_18.md` (security hardening).
