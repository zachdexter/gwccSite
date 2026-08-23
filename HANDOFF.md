# Handoff Notes for Future E-Board

This doc is for whoever takes over running the site after the current officers graduate. Read this once, then you shouldn't need it again unless something breaks.

## Day-to-day: everything happens in the admin dashboard

Log in at `/login` with the president or eboard password. Nobody should ever need to touch code or a database to run the site — the admin dashboard (`/admin`) covers all of it:

- **Members** — add/remove members, mark subsidized, view individual attendance history
- **Attendance** — check members in, view this week's attendance counts, manage semesters (create/activate/delete)
- **Comp Team** — manage the competitive team roster and headshots
- **E-Board** — manage the officer roster and headshots shown on the public site
- **Gallery** — photos sync automatically once a day from the club's shared Google Drive folder; click "Sync from Drive" on `/admin/gallery` to pull in new photos immediately instead of waiting, and pick which photos show in the homepage hero carousel
- **Alerts** — post/remove homepage announcement banners
- **Practice Times** — edit the practice schedule shown on the public site
- **Settings** — change the president/eboard login passwords (president can change either; eboard can only change their own)

To add new gallery photos, just drop them in the correct subfolder in the club's Google Drive gallery folder — no admin action needed, they'll appear on the next daily sync (or trigger it manually).

**If anything doesn't work, or you're not sure how to do something: email Zach Dexter (zsdexter05@gmail.com, VP '26-'27) — same address shown at the bottom of every admin page.** This doc is background context in case that's not possible, not a replacement for reaching out.

## Account ownership, for context

The site depends on a handful of outside services (hosting, database, image storage). Most were set up under Zach's personal accounts rather than a club-owned account, which is the main long-term risk to the site — not the code itself, but losing access to an account after graduation.

| Service | What it's for | Ownership |
|---|---|---|
| Google Drive (gallery folder) + the API key that reads it | Source of gallery photos | Club Google account — durable |
| GitHub (`github.com/zachdexter/gwccSite`) | Source code | Personal account |
| Vercel | Hosting/deployment | Personal account (signed in via the GitHub above) |
| Neon | Database (members, attendance, accounts, etc.) | Personal account |
| Cloudinary | Image hosting (gallery/headshot photos) | Personal account |

This is only relevant if the site needs a code change, redeploy, or env var update, and Zach isn't reachable — day-to-day admin use never touches any of this.

## See also

`README.md` has the technical/developer setup details, for whoever eventually picks this up as a maintainer.
