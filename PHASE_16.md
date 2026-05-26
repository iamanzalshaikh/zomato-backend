# Phase 16 — Redis & Queues ✅

## What was added

### BullMQ job queues

| Queue | Job | Processor |
|-------|-----|-----------|
| `notifications` | Order/user notifications | `processNotificationJob` |
| `emails` | Transactional email | SMTP via `sendTransactionalEmail` |
| `sms` | SMS alerts | Stub logger (Twilio later) |
| `refunds` | Razorpay refunds | `initiateRefund` |
| `analytics` | `warm_cache`, `invalidate_restaurants` | Cache warm / clear |

- Workers start in `server.ts` via `startQueueWorkers()`.
- If Redis is down or `ENABLE_BULLMQ=false`, jobs run **inline** (same behavior as before).
- Refunds: `POST /payments/refund` enqueues when BullMQ is active.

### Redis cache

Cached (default TTL **300s**, `CACHE_TTL_SECONDS`):

- Restaurant list / search / nearby
- Invalidated when owner updates restaurant

### Live rider tracking

- Redis key: `live:rider:{orderId}` (TTL **7200s**)
- Updated on `PATCH /riders/location`
- Cleared on delivery complete
- `GET /orders/track/:orderId` returns `liveLocation` from Redis when available

### Socket.io scaling

- `@socket.io/redis-adapter` when `SOCKET_REDIS_ADAPTER=true` and Redis is reachable
- Enables multiple API instances sharing socket rooms

## Env (`.env`)

```env
REDIS_URL=redis://127.0.0.1:6379
ENABLE_BULLMQ=true
SOCKET_REDIS_ADAPTER=true
CACHE_TTL_SECONDS=300
LIVE_LOCATION_TTL_SECONDS=7200
```

## Ops endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/system/status` | phase 16 flags |
| GET | `/api/v1/system/queues` | BullMQ job counts per queue |

## Test

```bash
# Terminal 1 — Redis
redis-server

# Terminal 2 — API
npm run dev
```

1. `GET /api/v1/system/queues` — should list queue stats after traffic  
2. Place order → notification jobs appear under `notifications`  
3. `GET /restaurants/search?q=biryani` twice — second response served from cache (faster; check Redis keys `cache:restaurants:*`)  
4. Rider updates location during active order → `GET /orders/track/:orderId` shows `liveLocation`  

## Architecture

```text
API Server(s) ──► BullMQ Workers (same process by default)
       │
       ├── Redis: cache, OTP, refresh tokens, live location
       └── Redis adapter: Socket.io pub/sub (multi-instance)
```

For production, run **dedicated worker processes** pointing at the same `REDIS_URL` (optional split later).

## Next: Phase 17

See `PHASE_17.md` (unified `/search` routes + trending).
