# Phase 19 — Testing ✅

## Test types

| Type | Command | Needs server? |
|------|---------|---------------|
| **Unit** | `npm run test:unit` | No (Mongo not required) |
| **Integration** | `npm run test:integration` | No (uses Supertest + MongoDB) |
| **All Vitest** | `npm run test` | MongoDB |
| **E2E script** | `npm run test:e2e` | Yes — `npm run dev` running |
| **Everything** | `npm run test:all` | Mongo + server for E2E |

## Setup

```bash
npm install
# MongoDB + Redis running
npm run seed:phase2
npm run seed:admin
```

## Unit tests (`tests/unit/`)

- XSS sanitization (`sanitize.util`)
- Search query normalization & cache hash

## Integration tests (`tests/integration/`)

Uses **Supertest** against `src/app.ts` (no HTTP server port).

- Health & system status
- Search APIs
- Auth register + login failure
- Admin login + dashboard (skips gracefully if admin not seeded)

`NODE_ENV=test` disables rate limiters during tests.

## E2E script (`scripts/e2e-test.ts`)

Full customer journey against a **live** API:

1. Health & system status  
2. Search & list restaurants  
3. Register + login customer  
4. Add address → cart → **COD order**  
5. Track order & history  
6. Notifications  
7. Admin login → dashboard → orders → analytics  

### Run E2E

**Terminal 1:**

```bash
npm run dev
```

**Terminal 2:**

```bash
npm run test:e2e
```

Optional env:

```env
E2E_BASE_URL=http://localhost:5000/api/v1
ADMIN_EMAIL=admin@foodapp.com
ADMIN_PASSWORD=Admin@123
```

Exit code `0` = all steps passed, `1` = at least one failure.

## Files

```
tests/
  setup.ts
  unit/
  integration/
scripts/
  e2e-test.ts
vitest.config.ts
```

## Next: Phase 20

Docker, PM2, Nginx, CI/CD deployment.
