# Phase 11 — Realtime Socket System ✅

Socket.io on the same server as REST (`http://localhost:5000`).

## Connect (mobile / web)

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: "<JWT access token>" },
  // or: query: { token: "<JWT>" }
  transports: ["websocket", "polling"],
});
```

## Auto-joined rooms

| Room | Who |
|------|-----|
| `user:{userId}` | Every authenticated connection |
| `rider:{riderId}` | Users with role `rider` (Rider document id) |

## Client → server events

| Event | Payload | Purpose |
|-------|---------|---------|
| `join_order` | `{ orderId }` | Track one order (customer / owner / assigned rider) |
| `leave_order` | `{ orderId }` | Leave order room |
| `join_restaurant` | `{ restaurantId }` | Restaurant panel — new orders |
| `leave_restaurant` | `{ restaurantId }` | Leave |

Server ack: `joined_order`, `joined_restaurant`, or `error`.

## Server → client events

| Event | When |
|-------|------|
| `order_created` | Order placed |
| `new_order` | Same — **restaurant room only** |
| `order_confirmed` | Paid / COD-wallet confirmed |
| `order_updated` | Status change (preparing, on the way, etc.) |
| `rider_assigned` | Rider accepted |
| `rider_location_update` | Rider PATCH `/riders/location` |
| `order_picked_up` | Rider picked up food |
| `order_delivered` | Delivered |
| `order_completed` | Delivered (alias for apps) |
| `order_cancelled` | Cancelled |

### Payload shape

```json
{
  "orderId": "...",
  "orderNumber": "ORD-...",
  "orderStatus": "PREPARING",
  "paymentStatus": "CAPTURED",
  "restaurantId": "...",
  "customerId": "...",
  "riderId": "...",
  "riderLocation": { "latitude": 19.07, "longitude": 72.87 },
  "timestamp": "2026-05-22T..."
}
```

## Who should listen to what

| App | Join | Listen |
|-----|------|--------|
| Customer | `join_order` on track screen | `order_*`, `rider_location_update` |
| Restaurant | `join_restaurant` | `new_order`, `order_updated` |
| Rider | auto `rider:{id}` | assignments on `user` + order events |

## REST still works

Sockets **push** updates; REST remains source of truth:

- `GET /orders/track/:orderId` for full timeline on open
- `PATCH /riders/location` still saves GPS (socket broadcasts it)

## Test with browser console

1. Login → copy `accessToken`  
2. Connect socket with token  
3. `socket.emit("join_order", { orderId: "..." })`  
4. From Postman, `PATCH /orders/status/:id` → see `order_updated` in client  

## Files

- `src/config/socket.ts` — init + CORS  
- `src/sockets/socket.handlers.ts` — auth + rooms  
- `src/services/socket.service.ts` — emit helpers  
- `src/types/socket.events.ts` — event names  

## Scale note

Single-server MVP. For multiple Node instances, add **Redis adapter** (Phase 16).

## Next: Phase 12

Push notifications (Firebase) + email/SMS queues.
