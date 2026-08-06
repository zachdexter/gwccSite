# GWCC Site

Admin site for the GW Climbing Club. Public pages (`/`, `/comp`, `/gallery`, `/eboard`, `/contact`, `/membership`) are server-rendered; `/admin/*` is a protected dashboard for managing members, attendance, the competitive team roster, eboard roster, and the photo gallery.

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind v4 + shadcn/ui
- **NextAuth v5** (Credentials provider, JWT sessions) — two roles: `president` and `eboard`
- **Drizzle ORM** + **Neon Postgres** (serverless HTTP client)
- **Cloudinary** for image hosting (gallery photos, comp/eboard headshots)
- **Google Drive API** — the gallery syncs photos from a shared Drive folder

## Environment Variables

Create a `.env.local` file in the project root with:

```
DATABASE_URL=              # Neon Postgres connection string
AUTH_SECRET=                # NextAuth signing secret (generate with `npx auth secret`)
AUTH_URL=                   # e.g. http://localhost:3000 in dev, your production URL in prod

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PRESIDENT_PASS=              # Seeded into the accounts table via `npm run db:seed`
EBOARD_PASS=                  # Seeded into the accounts table via `npm run db:seed`

GOOGLE_API_KEY=               # API key with Drive API access, used to read the gallery source folder
GOOGLE_DRIVE_FOLDER_ID=       # ID of the Drive folder containing gallery subfolders/albums

CRON_SECRET=                  # Bearer token used to authenticate scheduled cron requests
```

## Getting Started

```bash
npm install
npm run db:push    # apply the Drizzle schema to your Neon database
npm run db:seed    # hash PRESIDENT_PASS/EBOARD_PASS and seed the accounts table
npm run dev         # start the dev server at http://localhost:3000
```

Other useful scripts:

```bash
npm run build       # production build
npm run lint         # run ESLint
npm run db:studio   # open Drizzle Studio to inspect the database
```

## Gallery / Google Drive Sync

The gallery is populated by syncing images from a Google Drive folder rather than direct upload. `GOOGLE_DRIVE_FOLDER_ID` should point to a Drive folder whose subfolders each become a gallery album; images inside each subfolder are uploaded to Cloudinary and tracked in the `galleryPhotos`/`galleryAlbums` tables. The sync is triggered via `POST /api/sync-gallery`, either by a scheduled cron job (using the `CRON_SECRET` bearer token) or manually from `/admin/gallery`.

## Deploying

This app is designed to deploy on Vercel:

1. Set all of the environment variables above in the Vercel project settings.
2. Configure a Vercel Cron job to call `POST /api/sync-gallery` (and `GET /api/alerts/cleanup`) on your desired schedule, sending `Authorization: Bearer <CRON_SECRET>` — this must match the `CRON_SECRET` env var exactly, or those endpoints will reject the cron requests and fall back to requiring an admin session.
3. Run `npm run db:push` and `npm run db:seed` against the production database before first deploy (or via a one-off script/connection) to create the schema and seed admin accounts.
