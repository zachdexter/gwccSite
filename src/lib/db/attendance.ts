import { sql } from "drizzle-orm";

export const CHECK_IN_COOLDOWN_HOURS = 2;

// Inserts a check-in only if the member has no log in the last CHECK_IN_COOLDOWN_HOURS.
// Doing the check and the insert in one statement (rather than select-then-insert) keeps two
// eboard phones tapping the same member at once from both writing a log. Returns the new
// row's id, or no rows when the member is still on cooldown.
export function checkInUnlessRecentQuery({
  memberId,
  semesterId,
  loggedBy,
}: {
  memberId: number;
  semesterId: number;
  loggedBy: string;
}) {
  return sql`
    INSERT INTO attendance_logs (member_id, semester_id, logged_by)
    SELECT ${memberId}, ${semesterId}, ${loggedBy}
    WHERE NOT EXISTS (
      SELECT 1 FROM attendance_logs
      WHERE member_id = ${memberId}
        AND semester_id = ${semesterId}
        AND logged_at > now() - make_interval(hours => ${CHECK_IN_COOLDOWN_HOURS})
    )
    RETURNING id
  `;
}
