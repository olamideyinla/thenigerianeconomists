# The Nigerian Economists — Web App

Next.js 15 (App Router) · TypeScript strict · Prisma · next-auth v5

## Required Environment Variables

Copy `.env` and fill in real values before running.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for next-auth (run `openssl rand -base64 32`) |
| `RESEND_API_KEY` | API key from resend.com |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public base URL of the R2 bucket (e.g. `https://assets.example.com`) |
| `MEILI_HOST` | Meilisearch instance URL |
| `MEILI_API_KEY` | Meilisearch master or API key |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site (used for metadata and auth callbacks) |

## Getting Started

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest |
| `pnpm test:ui` | Run Vitest with UI |
| `pnpm prisma generate` | Regenerate Prisma client |
| `pnpm prisma migrate dev` | Apply migrations in development |

## Project Structure

```
web/
  app/
    (reader)/        Public-facing magazine pages
    admin/           Editor/admin dashboard
    api/             API routes
  components/
    reader/          Reader UI components
    admin/           Admin UI components
    common/          Shared components
  lib/
    db.ts            Prisma client singleton
    auth.ts          next-auth configuration
    mdx.ts           MDX compilation utilities
    citations.ts     Citation parsing
    media.ts         R2 upload helpers
    charts.ts        Recharts wrappers
  content/           Static MDX content
  styles/            Global CSS
  prisma/
    schema.prisma    Database schema
```
