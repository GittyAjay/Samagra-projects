# Solar Sales Management APIs on Nitro

This project turns the proposal into a Nitro-based backend that covers the main workflows for the solar sales system.
Persistence is handled through Prisma Client on PostgreSQL.

- authentication and simple session tokens
- product catalog management
- lead and inquiry intake
- staff lead assignment and survey scheduling
- quotation creation and approval
- order lifecycle, payment milestones, and invoice payloads
- notifications
- client, staff, and admin dashboards
- reporting summary endpoints

## Run locally

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Nitro will expose the API locally, usually at `http://localhost:3000`.

Open `http://localhost:3000/` for a small API welcome response and `http://localhost:3000/health` for a health check.
Swagger UI is available at `http://localhost:3000/docs` and the raw OpenAPI document is at `http://localhost:3000/openapi.json`.

## Seeded admin user

- Admin: `admin@solar.local` / `Admin@123`

## Main endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/register/verify`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password/request`
- `POST /api/auth/forgot-password/verify`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Leads and inquiries

- `POST /api/inquiries` — creates a lead; **server auto-assigns** an owner immediately when `assignedStaffId` is omitted (same rules as manual auto-assign: task tags + lowest load). Optional body `taskType`: `sales` | `survey` | `installation` | `general`. Response includes `autoAssigned: boolean`.
- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/leads/:id/assign`
- `POST /api/leads/:id/auto-assign` — admin; force-reassign
- `POST /api/leads/:id/survey`

### Scheduled auto-assign (cron)

- `POST /api/cron/auto-assign-sweep` — assigns **all open leads that still have no `assignedStaffId`** (e.g. backlog or if creation-time assign failed). **Requires env `CRON_SECRET`** and header `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`.
- Wire your host’s scheduler to hit this URL every few minutes (e.g. [Vercel Cron](https://vercel.com/docs/cron-jobs), GitHub Actions, or a system crontab calling `curl`).

### Quotations

- `GET /api/quotations`
- `GET /api/quotations/:id`
- `POST /api/quotations`
- `POST /api/quotations/:id/approve`

### Orders and payments

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `POST /api/orders/:id/payments`
- `GET /api/orders/:id/invoice`

### Dashboards and reports

- `GET /api/dashboard/client/:clientId`
- `GET /api/dashboard/staff/:staffId`
- `GET /api/dashboard/admin`
- `GET /api/reports/summary`

### Notifications and uploads

- `GET /api/notifications`
- `POST /api/notifications`
- `POST /api/push-tokens/register`
- `POST /api/uploads`

## Database setup

- Prisma schema: `prisma/schema.prisma`
- Runtime database URL is read from `.env` as `DATABASE_URL`
- Migration/build connection should be provided as `DIRECT_URL`
- If you use Supabase or any pooled Postgres connection for `DATABASE_URL`, set `DIRECT_URL` to the non-pooled direct connection so `prisma migrate deploy` can run during deployment
- Current storage strategy uses a Prisma-managed `AppEntity` table so every route persists to PostgreSQL without changing the API contract

## Email configuration

Add these values in `apis/.env` to enable Gmail-based transactional email:

- `SMTP_USER=your-gmail-address@gmail.com`
- `SMTP_APP_PASSWORD=your-16-character-app-password`
- `MAIL_FROM=your-gmail-address@gmail.com`
- Optional: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`

Registration OTP, password reset OTP, admin notifications, staff account creation, order creation, and order status updates will use this mail service.

## Firebase push setup

- Keep your Firebase Admin SDK file in `apis/` or set `FIREBASE_SERVICE_ACCOUNT_PATH` in `apis/.env`
- Mobile devices register their push token through `POST /api/push-tokens/register`
- Notification events that already use `notifyUser(...)` can now also send Firebase push notifications

## Notes

- Client registration now uses email OTP verification before the account is created.
- Invoices are returned as structured JSON payloads with a placeholder download URL instead of generating PDFs.
- Authorization is lightweight: pass `x-user-id` and `x-user-role` headers where role-restricted actions are needed.
