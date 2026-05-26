# Phase 18 — Security Implementation ✅

Hardens the API for production. Several items (JWT, bcrypt, Zod, Helmet, CORS) existed before; Phase 18 centralizes and extends them.

## Security stack

| Layer | Implementation |
|-------|----------------|
| **JWT auth** | User + admin tokens (unchanged) |
| **Password hashing** | bcrypt (unchanged) |
| **Input validation** | Zod on routes (unchanged) |
| **Helmet** | Security headers; HSTS + CSP in `production` |
| **CORS** | Whitelist via `CORS_ORIGINS` (dev: permissive) |
| **Rate limiting** | Tiered limiters per route group |
| **NoSQL injection** | Custom sanitizer on body/params (Express 5 compatible) |
| **XSS** | `xss` library strips HTML in body/query strings |
| **HPP** | `hpp` blocks duplicate query param attacks |
| **Body size** | `JSON_BODY_LIMIT` default `2mb` (was `10mb`) |
| **Audit logs** | Admin actions + refund requests → `audit_logs` |
| **Trust proxy** | `TRUST_PROXY=true` behind Nginx/load balancer |

## Rate limits

| Limiter | Routes | Default |
|---------|--------|---------|
| `apiRateLimiter` | All `/api/v1/*` | 200 / 15 min |
| `authStrictRateLimiter` | register, login, refresh-token | 20 / 15 min |
| `otpRateLimiter` | OTP send routes | 5 / min |
| `paymentRateLimiter` | `/payments/*` | 30 / 15 min |
| `adminLoginRateLimiter` | `/admin/login` | 10 / 15 min |
| `adminApiRateLimiter` | Admin routes after login | 120 / 15 min |

## Env (add to `.env`)

```env
CORS_ORIGINS=http://localhost:8081,http://localhost:5000
TRUST_PROXY=false
JSON_BODY_LIMIT=2mb
RATE_LIMIT_API_WINDOW_MS=900000
RATE_LIMIT_API_MAX=200
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_PAYMENT_MAX=30
```

**Production:**

```env
NODE_ENV=production
CORS_ORIGINS=https://yourapp.com,https://admin.yourapp.com
TRUST_PROXY=true
```

## Audit logging

Written to MongoDB `audit_logs` for:

- User block / unblock
- Restaurant approve / reject
- Rider approve / reject
- Admin order cancel
- Payment refund request

Fields: `actorId`, `actorRole`, `module`, `action`, `entityId`, `ipAddress`, `user-agent`.

## Files

- `src/config/security.ts`
- `src/middlewares/sanitize.middleware.ts`
- `src/utils/sanitize.util.ts`
- `src/services/audit.service.ts`
- `src/middlewares/rateLimit.middleware.ts` (expanded)
- `src/app.ts` (wired)

## Verify

```bash
npm run dev
GET /api/v1/system/status
```

Check `data.security` flags.

Try XSS in body (should be stripped):

```json
POST /api/v1/auth/register
{ "fullName": "<script>alert(1)</script>", ... }
```

## Next: Phase 19

Automated tests (API + payments + sockets).
