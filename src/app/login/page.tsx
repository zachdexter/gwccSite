"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect password.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gwcc-dark px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-gwcc-gold font-semibold tracking-widest text-xs uppercase">
            GW Climbing Club
          </span>
          <h1 className="mt-2 text-2xl font-bold text-gwcc-light">Admin Access</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gwcc-light/70 text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="bg-gwcc-navy border-white/10 text-gwcc-light placeholder:text-white/20 focus-visible:ring-gwcc-gold"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-gwcc-light/30 hover:text-gwcc-light/60 text-sm transition-colors">
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
