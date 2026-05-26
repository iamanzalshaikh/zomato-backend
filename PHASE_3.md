# Phase 3 — Authentication System ✅

## APIs (`/api/v1/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | No | Email + password signup |
| POST | `/login` | No | Email + password login |
| POST | `/send-otp` | No | OTP (`purpose`: signup \| login \| reset) |
| POST | `/verify-otp` | No | Verify OTP & login/signup |
| POST | `/refresh-token` | No | Rotate access + refresh tokens |
| POST | `/logout` | No | Revoke refresh token + clear cookies |
| POST | `/forgot-password` | No | Send reset OTP |
| POST | `/reset-password` | No | OTP + new password |
| GET | `/me` | Yes | Current user |

### Legacy (still work)
- `/signup/send-otp`, `/signup/verify-otp`
- `/login/send-otp`, `/login/verify-otp`

## Register body
```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "mobile": "9999999999",
  "password": "password123",
  "role": "customer"
}
```

## Send OTP body
```json
{
  "email": "john@gmail.com",
  "purpose": "login"
}
```

## Refresh token
Body or cookie: `refreshToken`

## Dev mode
OTP returned as `devOtp` in send-otp / forgot-password responses when `NODE_ENV=development`.

## Not implemented
- Google/Apple social login (`POST /auth/social/:provider` → 501)

## Next: Phase 4
Users module — addresses, favorites, wallet, order history APIs.
