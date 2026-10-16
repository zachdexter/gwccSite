import { neon } from "@neondatabase/serverless";

// One-off: weeks moved from Sunday–Saturday to Monday–Sunday. Week requirement rows are
// keyed by the week's start date, so shift each Sunday key to the following Monday.
// Attendance logs are plain timestamps and need no change. Idempotent: only Sunday keys
// are touched, so re-running is a no-op.
async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  const before = await sql`
    select id, semester_id, week_start::text as week_start, required, reason
    from week_requirements order by semester_id, week_start`;
  console.log("Before:", before);

  const updated = await sql`
    update week_requirements
    set week_start = week_start + 1, updated_at = now()
    where extract(dow from week_start) = 0
    returning id, week_start::text as week_start`;
  console.log(`Shifted ${updated.length} row(s):`, updated);

  const after = await sql`
    select id, semester_id, week_start::text as week_start, required, reason
    from week_requirements order by semester_id, week_start`;
  console.log("After:", after);
  if (after.length !== before.length) throw new Error("Row count changed — investigate!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
