# Le Saphir

Le Saphir is a full-stack restaurant portfolio project for a fictional independent restaurant in Paris. Customers can browse a database-backed menu, configure dishes, place demonstration collection or delivery orders, and reserve tables. Staff can manage service queues and availability; administrators can also edit menu content, opening hours, and operating settings.

## Stack

- Next.js 16 App Router, React 19 and TypeScript
- PostgreSQL with Drizzle ORM and `postgres.js`
- Zod validation
- Server-side staff sessions with scrypt password hashing
- Next.js metadata, image optimization and generated social imagery
- Optional Resend-compatible transactional email API

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and update the values.
3. Create a PostgreSQL database.
4. Run `npm run db:migrate`, then `npm run db:seed`, then `npm run db:migrate:staff`.
5. Set `STAFF_ADMIN_EMAIL`, `STAFF_ADMIN_PASSWORD`, and `STAFF_ADMIN_NAME`, then run `npm run staff:create-admin`.
6. Start the application with `npm run dev`.

`STAFF_ADMIN_PASSWORD` must contain at least 12 characters. Never commit `.env` files.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Production providers commonly require `sslmode=require`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin, for example `https://restaurant.example`. Required for production SEO. |
| `STAFF_ADMIN_EMAIL` | Email used by the administrator bootstrap script. |
| `STAFF_ADMIN_PASSWORD` | Initial administrator password; used only by the bootstrap script. |
| `STAFF_ADMIN_NAME` | Display name for the initial administrator. |
| `EMAIL_API_KEY` | Optional transactional email API key. |
| `EMAIL_FROM` | Verified sender address used for order and reservation messages. |

Email is intentionally optional in local development. When either email variable is absent, successful orders and reservations are still persisted and checkout continues without sending a message. Provider failures are isolated from the database transaction.

## Useful routes

- `/`, `/menu`, `/cart`, `/checkout`, `/reservations`, `/visit`, `/about`
- `/staff/login` for authenticated operations
- `/staff/orders`, `/staff/reservations`, `/staff/menu`, `/staff/settings`

Staff pages, checkout, carts, API routes, and customer confirmation URLs are excluded from indexing.

## Verification

```bash
npm test
npm run typecheck
npm run build
npm audit --omit=dev
```

The project can be compiled without a database connection, but menu, order, reservation, and staff workflows require PostgreSQL at runtime. Run migrations against a staging database and exercise those workflows before production launch.

## Deployment notes

- Use Node.js 20 or newer and run `npm run build` followed by `npm start`.
- Set every production environment variable in the hosting platform, not in source control.
- Run all three migration commands before serving traffic.
- Configure a verified email sender if confirmations are required.
- Ensure the PostgreSQL provider permits the deployed runtime and configure SSL according to the provider's instructions.
- This is a portfolio demonstration: payment is deliberately simulated and no card information is collected.
