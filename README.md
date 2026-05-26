# clone-backend

Food App backend — scaffolded from HerRidez-backend patterns.

## Stack

Express 5 · TypeScript · MongoDB · Redis · Socket.io · JWT · Swagger

## Setup

```bash
npm install
cp .env.example .env
npm run dev
npm run seed:phase2  # demo restaurant + menu
npm run seed:admin   # admin@foodapp.com / Admin@123
```

## Testing (Phase 19)

```bash
# Unit + integration (needs MongoDB)
npm run test

# End-to-end against running server (Terminal 1: npm run dev)
npm run test:e2e

# Both
npm run test:all
```

See `PHASE_19.md` for full details.

## Project structure

```
src/
├── config/          db, redis, logger, mail, swagger, socket
├── constants/
├── controllers/     auth, profile, public
├── helpers/         pagination
├── middlewares/     auth, adminAuth, validate, rateLimit, errors
├── models/          User, AdminUser
├── routes/          auth, profile, public
├── seeds/           adminUser.seed
├── services/        otp (Redis), email, notifications (stub)
├── types/
├── utils/           jwt, otp, token, AppError, apiResponse
└── validators/      Zod schemas
```

## API routes

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/v1/health` | No |
| GET | `/api/v1/public/info` | No |
| GET | `/api/v1/public/terms` | No |
| POST | `/api/v1/auth/signup/send-otp` | No |
| POST | `/api/v1/auth/signup/verify-otp` | No |
| POST | `/api/v1/auth/login/send-otp` | No |
| POST | `/api/v1/auth/login/verify-otp` | No |
| POST | `/api/v1/auth/logout` | Yes |
| GET | `/api/v1/auth/me` | Yes |
| GET | `/api/v1/profile` | Yes |
| PATCH | `/api/v1/profile` | Yes |
| POST | `/api/v1/profile/onboarding/complete` | Yes |

## Dev OTP

In `development`, OTP is logged to the console and returned as `devOtp` in the send-otp response.

## Docs

Swagger UI: `http://localhost:5000/api-docs`
