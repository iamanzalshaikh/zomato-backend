# Phase 14 — Support System ✅

Base: `/api/v1/support` (customer JWT)  
Admin: `/api/v1/admin/support/*` (admin JWT)

## Customer APIs

| Method | Route | Body |
|--------|-------|------|
| POST | `/tickets` | `issueType`, `description`, `orderId?`, `images?[]` |
| GET | `/tickets` | `?page&limit&status` |
| GET | `/tickets/:ticketId` | Ticket + replies |
| POST | `/tickets/reply` | `{ "ticketId", "message" }` |
| PATCH | `/tickets/:ticketId` | `{ "status": "CLOSED" }` — customer close only |

### Issue types

`PAYMENT` | `DELIVERY` | `FOOD` | `REFUND` | `OTHER`

### Refund shortcut

`POST /orders/refund-request` still works — creates a `REFUND` ticket (delivered orders only).

## Admin APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/admin/support/tickets` | All tickets `?status&issueType` |
| GET | `/admin/support/tickets/:ticketId` | Details |
| POST | `/admin/support/tickets/reply` | `{ "ticketId", "message" }` |
| PATCH | `/admin/support/tickets/:ticketId` | `{ "status", "resolution?" }` |
| GET | `/admin/refunds` | Open REFUND tickets (shortcut list) |

## Ticket lifecycle

```
OPEN → IN_PROGRESS (admin first reply) → RESOLVED / CLOSED
```

Customer can **CLOSED** their own ticket.

## Replies

Stored on ticket as `replies[]` with `authorRole`: `customer` | `admin`.

## Example — create ticket

```json
POST /api/v1/support/tickets
Authorization: Bearer <customer-token>

{
  "issueType": "DELIVERY",
  "description": "Order arrived late and food was cold",
  "orderId": "<order-id>"
}
```

## Example — admin resolve

```json
PATCH /api/v1/admin/support/tickets/:ticketId
Authorization: Bearer <admin-token>

{
  "status": "RESOLVED",
  "resolution": "Refund of ₹50 credited to wallet within 24 hours."
}
```

## Next: Phase 15

Analytics dashboards — see `PHASE_15.md`.
