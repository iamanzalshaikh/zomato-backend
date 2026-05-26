# Phase 12 — Notification System ✅

In-app + email + push (stub) + SMS (stub), queued via Redis.

## Channels

| Channel | Status |
|---------|--------|
| **In-app** | ✅ Saved to `notifications` collection |
| **Email** | ✅ SMTP via `mail.ts` (logs in dev if no SMTP) |
| **Push** | ⚠️ Stub — logs FCM tokens; register token API ready |
| **SMS** | ⚠️ Stub — logs only (Twilio in production later) |

## Queue jobs (BullMQ — see Phase 16)

Jobs on BullMQ queue `notifications` (legacy list `queue:notifications` removed):

- `notify_user` — all channels for one user
- `send_in_app` / `send_email` / `send_push` / `send_sms` — single channel

Worker runs in `server.ts` (poll every 400ms). If Redis is down, jobs run inline.

## APIs (`/api/v1/notifications`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | List notifications (paginated) |
| PATCH | `/read/:notificationId` | Mark one read |
| PATCH | `/read-all` | Mark all read |
| DELETE | `/:notificationId` | Delete one |
| POST | `/device-token` | Register push token `{ token, platform }` |
| DELETE | `/device-token` | Remove token `{ token }` |

**Legacy:** `/api/v1/users/notifications` still works (same behaviour).

## Auto notifications (order events)

Triggered with socket/order flow:

| Event | Customer | Restaurant owner | Rider |
|-------|----------|------------------|-------|
| Order placed | ✅ | ✅ `new_order` | — |
| Confirmed / status | ✅ | — | — |
| Rider assigned | ✅ | — | ✅ |
| Delivered / cancelled | ✅ | — | — |

Location updates: in-app + push only (no email spam).

## Mobile — register FCM token

```json
POST /api/v1/notifications/device-token
Authorization: Bearer <token>

{
  "token": "<fcm-device-token>",
  "platform": "android"
}
```

Platforms: `android` | `ios` | `web`

## Email

Configure SMTP in `.env` (same as OTP emails). Without SMTP, emails are logged as `[DEV] Email not sent`.

## Test

1. Place order (COD) → check `GET /notifications`  
2. Restaurant owner login → should see `new_order` notification  
3. Check server logs for `[Push stub]` after registering device token  

## Next: Phase 13

Admin panel — approve riders/restaurants, platform dashboard.
