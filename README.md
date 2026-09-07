# 🚑 RapidAid — Emergency Ambulance Dispatch API

Priority-based ambulance dispatch backend, from the emergency call to hospital arrival and payment.

When someone calls for an ambulance, three things decide whether help arrives in time: how fast a
free ambulance is found, whether two dispatchers can grab the same one, and whether the crew, the
patient and the hospital stay in sync afterwards. RapidAid solves those in the database rather than
in the caller's head — priority-ordered dispatch, transaction-guarded assignment, and a trip state
machine that only moves in legal directions.

---

## 🔗 Live API

Base URL: **https://rapidaid-api-ivyf.onrender.com**

| Resource | URL |
|---|---|
| Swagger UI | `/api/v1/docs` |
| OpenAPI JSON | `/api/v1/docs/openapi.json` |
| Postman collection (download) | `/api/v1/docs/postman` |
| Health check | `/api/v1/health` |

### Demo accounts

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@rapidaid.com | Admin@RapidAid2026 |
| DRIVER | driver1@rapidaid.com | Demo@RapidAid2026 |
| PATIENT | patient@rapidaid.com | Demo@RapidAid2026 |

> Seeded accounts for evaluation only. Passwords come from `ADMIN_PASSWORD` / `SEED_PASSWORD`.

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 4 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Validation | Zod (every body, param and query) |
| Auth | JWT access + refresh, bcrypt hashing, Google OAuth 2.0 |
| Payments | SSLCommerz (sandbox) with server-side validation |
| Caching | Redis (optional — the API runs without it) |
| Security | helmet, CORS allow-list, express-rate-limit |
| Docs | Swagger UI + Postman collection, both served by the API |
| Deployment | Render (`render.yaml` blueprint included) |

---

## 👥 Roles

Three fixed roles, enforced by middleware on every protected route.

| Role | Can do |
|---|---|
| **PATIENT** | Raise and cancel emergency requests, follow their trip, pay the fare, read their own notifications |
| **DRIVER** | Go on/off duty, drive assigned trips through the state machine, pick the destination hospital, complete trips |
| **ADMIN** | Manage users, fleet, hospitals and drivers, dispatch ambulances, read the audit trail, dashboard stats and reports |

Role alone is not always enough: where a record has an owner, the service also checks ownership and
answers `403` when the role is right but the row belongs to someone else.

---

## 🔄 Core Flow

```text
Emergency Request  →  Priority (CRITICAL/HIGH/MEDIUM/LOW)
        ↓
Find Available Ambulance   (free driver + free ambulance + no active trip)
        ↓
Dispatch                   (single transaction: request + ambulance + driver + trip + audit + notify)
        ↓
EN_ROUTE_TO_PICKUP → PATIENT_PICKED_UP → EN_ROUTE_TO_HOSPITAL → ARRIVED_AT_HOSPITAL
        ↓
Complete                   (fare = baseFare + perKmRate × distanceKm, payment row created)
        ↓
SSLCommerz checkout → gateway validation → PAID
```

---

## 🗄️ Data Model

Nine models: `User`, `DriverProfile`, `Ambulance`, `Hospital`, `EmergencyRequest`, `Trip`,
`Payment`, `Notification`, `AuditLog`.

- **Relations** — a driver profile belongs to one user and optionally one ambulance; an emergency
  request has at most one trip; a trip has one ambulance, one driver, an optional hospital and many
  payment attempts.
- **Constraints** — unique `email`, `googleId`, `licenseNumber`, `nid`, `regNumber`, `transactionId`,
  and a unique `requestId` on `Trip` so one emergency can never spawn two trips.
- **Indexes** — 24 in total, including the composite `(status, priority, createdAt)` that orders the
  dispatch queue and `(userId, isRead)` for notification inboxes.
- **Money** — `Decimal(10,2)` everywhere, never floats.
- **Soft deletes** — `isDeleted` + `deletedAt` on users, ambulances and hospitals; requests and trips
  carry `CANCELLED` states instead, because an emergency record must never disappear.

Migrations live in `backend/prisma/migrations` (three, applied in order).

---

## 🔌 API — 54 endpoints

Base URL: `/api/v1`. All responses use one envelope.

```jsonc
// success
{ "success": true, "statusCode": 200, "message": "Operation successful", "meta": { }, "data": { } }

// error
{ "success": false, "statusCode": 400, "message": "Validation error",
  "errors": [{ "path": "body.email", "message": "A valid email is required" }] }
```

<details open>
<summary><b>Auth (7)</b></summary>

| Method | Path | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/google` | Public |
| GET | `/auth/google/callback` | Public |
| POST | `/auth/refresh-token` | Refresh cookie |
| POST | `/auth/change-password` | Authenticated |
| POST | `/auth/logout` | Authenticated |
</details>

<details>
<summary><b>Users (6)</b></summary>

| Method | Path | Access |
|---|---|---|
| GET | `/users/me` | Authenticated |
| PATCH | `/users/me` | Authenticated |
| GET | `/users` | ADMIN — page, limit, sort, search, role/status filter |
| GET | `/users/:id` | ADMIN |
| PATCH | `/users/:id/status` | ADMIN — block/unblock, audited |
| DELETE | `/users/:id` | ADMIN — soft delete |
</details>

<details>
<summary><b>Drivers (4)</b></summary>

| Method | Path | Access |
|---|---|---|
| POST | `/drivers` | ADMIN — creates user + profile in one transaction |
| GET | `/drivers` | ADMIN — page, sort, search, availability filter |
| GET | `/drivers/me` | DRIVER |
| PATCH | `/drivers/me/availability` | DRIVER — feeds the dispatch pool |
</details>

<details>
<summary><b>Ambulances (6)</b></summary>

| Method | Path | Access |
|---|---|---|
| POST | `/ambulances` | ADMIN |
| GET | `/ambulances` | ADMIN, DRIVER — page, limit, sort, search, type/status/area filters |
| GET | `/ambulances/:id` | ADMIN, DRIVER |
| PATCH | `/ambulances/:id` | ADMIN |
| PATCH | `/ambulances/:id/status` | ADMIN, DRIVER |
| DELETE | `/ambulances/:id` | ADMIN — soft delete, blocked while on an active trip |
</details>

<details>
<summary><b>Hospitals (5)</b></summary>

| Method | Path | Access |
|---|---|---|
| POST | `/hospitals` | ADMIN |
| GET | `/hospitals` | Authenticated — cached, search + area + specialization filters |
| GET | `/hospitals/:id` | Authenticated |
| PATCH | `/hospitals/:id` | ADMIN |
| DELETE | `/hospitals/:id` | ADMIN — soft delete |
</details>

<details>
<summary><b>Emergency Requests (6)</b></summary>

| Method | Path | Access |
|---|---|---|
| POST | `/emergency-requests` | PATIENT — one open request at a time |
| GET | `/emergency-requests` | PATIENT (own), ADMIN (all) — search, status/priority filters |
| GET | `/emergency-requests/:id` | Owner or ADMIN |
| PATCH | `/emergency-requests/:id` | PATIENT, while PENDING |
| PATCH | `/emergency-requests/:id/cancel` | Owner or ADMIN |
| POST | `/emergency-requests/:id/dispatch` | ADMIN — transaction-safe assignment |
</details>

<details>
<summary><b>Trips (6)</b></summary>

| Method | Path | Access |
|---|---|---|
| GET | `/trips` | ADMIN — status, driver and date-range filters |
| GET | `/trips/me` | DRIVER (assigned), PATIENT (own history) |
| GET | `/trips/:id` | Participant or ADMIN |
| PATCH | `/trips/:id/status` | Assigned DRIVER or ADMIN — validated transitions |
| PATCH | `/trips/:id/hospital` | Assigned DRIVER or ADMIN |
| PATCH | `/trips/:id/complete` | Assigned DRIVER or ADMIN — fare + payment + audit |
</details>

<details>
<summary><b>Payments (7)</b></summary>

| Method | Path | Access |
|---|---|---|
| POST | `/payments/init/:tripId` | PATIENT — creates the SSLCommerz session |
| POST | `/payments/success` | Gateway callback |
| POST | `/payments/fail` | Gateway callback |
| POST | `/payments/cancel` | Gateway callback |
| POST | `/payments/ipn` | Gateway server-to-server, idempotent |
| GET | `/payments/me` | PATIENT (own), ADMIN (all) — status tracking |
| GET | `/payments/:id` | Owner or ADMIN |
</details>

<details>
<summary><b>Notifications (3)</b></summary>

| Method | Path | Access |
|---|---|---|
| GET | `/notifications` | Authenticated — own inbox, unread count in meta |
| PATCH | `/notifications/:id/read` | Authenticated |
| PATCH | `/notifications/read-all` | Authenticated |
</details>

<details>
<summary><b>Admin (3) + Utility (1)</b></summary>

| Method | Path | Access |
|---|---|---|
| GET | `/admin/dashboard-stats` | ADMIN — Redis-cached counters |
| GET | `/admin/audit-logs` | ADMIN — entity/action/actor/date filters |
| GET | `/admin/reports/trips` | ADMIN — revenue, breakdowns, per-day series |
| GET | `/health` | Public |
</details>

---

## ▶️ Try the Full Flow

Twelve calls take you from an emergency call to a payable bill. Nothing else is needed — the seed
already provides ambulances, hospitals and drivers on duty.

| # | Method | Endpoint | Role | Save from response |
|---|---|---|---|---|
| 1 | POST | `/auth/login` | — | `adminToken` |
| 2 | POST | `/auth/login` | — | `patientToken` |
| 3 | POST | `/auth/login` | — | `driverToken` (`driver3@rapidaid.com`) |
| 4 | GET | `/hospitals` | any | `hospitalId` |
| 5 | POST | `/emergency-requests` | patient | `requestId` |
| 6 | POST | `/emergency-requests/{requestId}/dispatch` | admin | `tripId` |
| 7 | PATCH | `/trips/{tripId}/status` → `EN_ROUTE_TO_PICKUP` | driver | |
| 8 | PATCH | `/trips/{tripId}/status` → `PATIENT_PICKED_UP` | driver | |
| 9 | PATCH | `/trips/{tripId}/hospital` → `{ hospitalId }` | driver | |
| 10 | PATCH | `/trips/{tripId}/status` → `EN_ROUTE_TO_HOSPITAL` | driver | |
| 11 | PATCH | `/trips/{tripId}/status` → `ARRIVED_AT_HOSPITAL` | driver | |
| 12 | PATCH | `/trips/{tripId}/complete` → `{ "distanceKm": 12.5 }` | driver | `fare`, `paymentId` |

Then `POST /payments/init/{tripId}` returns a live SSLCommerz `gatewayPageURL`.

```json
// 5. the emergency
{
  "pickupAddress": "House 42, Road 11, Banani, Dhaka",
  "patientCondition": "Severe chest pain, conscious but breathing with difficulty",
  "priority": "CRITICAL",
  "requestedAmbulanceType": "ICU"
}
```

Notes on the sequence:

- There is **no `POST /trips`**. The trip is created inside the dispatch transaction at step 6,
  together with the ambulance and driver assignment, the audit log and the notifications.
- Steps 7 to 11 cannot be skipped or reordered — the trip state machine allows one hop at a time.
- Step 9 must come before step 10, otherwise the API answers
  `Select a destination hospital before heading there`.
- Requesting `ICU` at step 5 makes the assignment deterministic: the seeded ICU ambulance
  `DHA-AMB-1003` belongs to `driver3@rapidaid.com`.
- The fare at step 12 is computed server side. For the ICU ambulance at 12.5 km it is
  `2000 + 80 × 12.5 = 3000.00 BDT`.

---

## 🛡️ Security & Performance

- **Passwords** — bcrypt, 12 rounds, never selected into a response.
- **Tokens** — short-lived access token in the `Authorization: Bearer` header, refresh token in an
  httpOnly cookie.
- **Rate limiting** — 300 requests / 15 min per IP across `/api/v1`, and a tighter 20 failed
  attempts on register, login and refresh.
- **Headers & CORS** — `helmet` plus an origin allow-list driven by `CLIENT_URL`.
- **Transactions** — dispatch, trip cancel, trip completion, driver creation and payment settlement
  all run in `prisma.$transaction`, with conditional `updateMany` guards so a row that changed under
  us aborts the whole operation with `409` instead of double-booking an ambulance.
- **Payments** — the callback never trusts its own body: the `val_id` is re-validated against
  SSLCommerz, then transaction id, currency and amount are compared before anything is marked `PAID`.
- **Caching** — Redis, optional. Dashboard stats (60s) and hospital lists (120s, invalidated on
  write). Without `REDIS_URL` every helper degrades to a miss and the API serves from Postgres.
- **Auditing** — dispatches, blocks, completions and settled payments write `AuditLog` rows with
  actor plus before/after snapshots, readable at `/admin/audit-logs`.

---

## 💻 Local Setup

```bash
git clone https://github.com/ahadverse/rapidaid.git
cd rapidaid/backend
npm install

# create backend/.env.development with DATABASE_URL, both JWT secrets,
# the Google OAuth pair and the SSLCommerz store credentials
npm run prisma:generate
npm run prisma:migrate               # applies the three migrations
npm run seed                         # admin, 3 drivers + ambulances, patient, hospitals

npm run dev                          # http://localhost:5000
```

Open `http://localhost:5000/api/v1/docs`, log in as the admin, paste the `accessToken` into
**Authorize**, and every endpoint is callable from the browser.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Watch mode |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run prisma:deploy` | Apply migrations to production |
| `npm run seed` / `npm run seed:prod` | Seed demo data |
| `npm run lint` / `npm run format` | ESLint / Prettier |

---

## 🚀 Deployment (Render)

The repo ships a `render.yaml` blueprint.

1. Push the repo to GitHub.
2. Render → **New → Blueprint** → pick the repo. It reads `render.yaml` (root directory `backend`,
   build `npm ci && prisma generate && prisma migrate deploy && npm run build`, health check
   `/api/v1/health`).
3. Fill in the secrets marked `sync: false` — `DATABASE_URL` (Neon), both JWT secrets, the Google
   OAuth pair, the SSLCommerz store credentials, and the four callback URLs pointing at the live
   host (`https://rapidaid-api-ivyf.onrender.com/api/v1/payments/...`). `REDIS_URL` is optional.
4. Deploy, then seed the production database once from your machine:
   `npm run seed:prod` with `.env.production` pointing at the same `DATABASE_URL`.
5. Update `GOOGLE_CALLBACK_URL` in the GCP console and the SSLCommerz panel to the live host.

---

## 🏗️ Architecture

Every module follows the same path: **route → validation → controller → service → Prisma**. Controllers
never touch the database; services never touch `req` or `res`.

---

## 📝 License

MIT © Ahad Hossain
