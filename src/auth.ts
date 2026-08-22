import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// In-memory per-instance limiter. Best-effort: resets on cold start and isn't
// shared across serverless instances, but it stops the common case of a
// single client hammering the two shared passwords.
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.password || typeof credentials.password !== "string") {
          return null;
        }

        const ip = getClientIp(request);
        const entry = failedAttempts.get(ip);
        const now = Date.now();

        if (entry && entry.lockedUntil > now) {
          return null;
        }

        const rows = await db.select().from(accounts);

        for (const account of rows) {
          const match = await bcrypt.compare(credentials.password, account.passwordHash);
          if (match) {
            failedAttempts.delete(ip);
            return { id: String(account.id), role: account.role };
          }
        }

        const nextCount = (entry && entry.lockedUntil <= now ? 0 : entry?.count ?? 0) + 1;
        failedAttempts.set(ip, {
          count: nextCount,
          lockedUntil: nextCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
        });

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
});
