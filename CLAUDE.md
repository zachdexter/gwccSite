# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js Version Warning

This project uses **Next.js 16.2.4**, which has breaking changes from earlier versions. APIs, conventions, and file structure differ significantly from training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.** Heed deprecation notices.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:push      # Apply schema changes to Neon (uses .env.local)
npm run db:studio    # Open Drizzle Studio UI
npm run db:seed      # Seed initial admin accounts from PRESIDENT_PASS/EBOARD_PASS
```

## Environment Variables (.env.local)

```
DATABASE_URL=         # Neon Postgres connection string
AUTH_SECRET=          # NextAuth signing secret
AUTH_URL=             # e.g. http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PRESIDENT_PASS=       # Seeded into accounts table via db:seed
EBOARD_PASS=          # Seeded into accounts table via db:seed
RESEND_API_KEY=       # Sends /contact form submissions via Resend
RESEND_FROM_EMAIL=    # Optional: verified sender, defaults to onboarding@resend.dev
```

## Architecture Overview

This is the admin site for the GW Climbing Club. Public pages are server-rendered; admin pages are client components that fetch from API routes.

**Public routes**: `/` (home), `/comp`, `/gallery`, `/login`  
**Protected routes**: `/admin/*` — gated by `src/proxy.ts` middleware, which redirects unauthenticated requests to `/login`

### Auth

- **NextAuth v5** with a Credentials provider (password only, no OAuth)
- Two roles: `"president"` and `"eboard"` — stored in `accounts` table with bcrypt hashes
- `src/auth.ts` exports `{ handlers, signIn, signOut, auth }`
- JWT sessions — role is embedded in the token via the `jwt` callback and surfaced on `session.user.role`
- President can change both passwords; eboard can only change eboard password

### Database

- **Drizzle ORM** + **Neon Postgres** (HTTP client via `@neondatabase/serverless`)
- Schema: `src/lib/db/schema.ts` — 6 tables: `members`, `semesters`, `attendanceLogs`, `compMembers`, `galleryPhotos`, `accounts`
- DB instance: lazy singleton via Proxy in `src/lib/db/index.ts` — initialize on first use, not at import time
- Workflow: edit schema → `npm run db:push` → query via the singleton

### API Routes (`src/app/api/`)

All routes call `auth()` and return 401 if no session. Patterns:
- `GET` — fetch data for admin pages
- `POST` — create records
- `PATCH` — update (activate, toggle subsidy, edit details)
- `DELETE` — soft delete via `active = false` (members, comp members) or hard delete (semesters, gallery, attendance undo)

Attendance undo is time-gated: delete is only allowed if the log is < 5 minutes old.

### Attendance Flow

`attendanceLogs` links members to semesters with a timestamp. The admin attendance page shows this week's check-in count per member (color-coded: green ≥2, yellow =1, red =0) and uses optimistic UI with a 5-minute undo toast.

Week/attendance calculation utilities live in `src/lib/semester.ts`.

### Images

All photos (gallery + comp team headshots) are hosted on **Cloudinary**. The gallery API uploads to Cloudinary and stores the `publicId` + `secureUrl` in the DB. Deletion removes from both. Cloudinary helpers are in `src/lib/cloudinary.ts`.

### Contact Form

`/contact` renders `ContactForm` (`src/components/ContactForm.tsx`), which POSTs to `src/app/api/contact/route.ts`. That route sends an email via **Resend** to `siteConfig.contactEmail` (`src/config/site.ts`) with the visitor's address as `replyTo`. The email address is intentionally kept out of the public page's HTML (no `mailto:` link) to avoid scrapers — it only ever appears server-side.

### Styling

- **Tailwind v4** with custom GWCC color tokens defined in `src/app/globals.css`:
  - `gwcc-navy: #0f3559`, `gwcc-dark: #1e293d`, `gwcc-light: #eae6e3`, `gwcc-gold: #dbd29b`
- Dark theme as default
- **shadcn/ui** components in `src/components/ui/` — extend via `components.json`
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge)

### Seeding

`scripts/seed.ts` reads `PRESIDENT_PASS` and `EBOARD_PASS` from `.env.local`, hashes them with bcrypt, clears the `accounts` table, and inserts two rows. Run this once after initial setup or whenever passwords need resetting at the DB level.
