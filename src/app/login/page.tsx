"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DecorIcon = {
  src: string;
  left: number;
  top: number;
  size: number;
  rotate?: number;
};

const decorIcons: DecorIcon[] = [
  { src: "/whitesvgs/girlclimbing.svg", left: 41.1, top: 36.7, size: 96 },
  { src: "/whitesvgs/rockon.svg", left: 56.8, top: 69.0, size: 63 },
  { src: "/whitesvgs/star4.svg", left: 16.5, top: 84.6, size: 32 },
  { src: "/whitesvgs/star17.svg", left: 88.8, top: 86.0, size: 32 },
  { src: "/whitesvgs/star2.svg", left: 7.5, top: 32.0, size: 32 },
  { src: "/whitesvgs/star12.svg", left: 97.0, top: 20.1, size: 32 },
  { src: "/whitesvgs/star13.svg", left: 77.0, top: 21.1, size: 32 },
  { src: "/whitesvgs/star12.svg", left: 58.4, top: 8.8, size: 32 },
  { src: "/navysvgs/star3.svg", left: 34.0, top: 23.1, size: 32 },
  { src: "/navysvgs/star6.svg", left: 27.7, top: 77.2, size: 32 },
  { src: "/navysvgs/star4.svg", left: 88.2, top: 41.3, size: 32 },
  { src: "/navysvgs/star19.svg", left: 61.8, top: 89.7, size: 32 },
  { src: "/navysvgs/star3.svg", left: 44.5, top: 67.4, size: 32 },
  { src: "/navysvgs/mountain.svg", left: 7.4, top: 68.1, size: 63 },
  { src: "/navysvgs/hold2.svg", left: 59.6, top: 27.8, size: 32 },
  { src: "/whitesvgs/dude.svg", left: 18.5, top: 19.0, size: 88 },
  { src: "/whitesvgs/hold3.svg", left: 39.9, top: 7.7, size: 32 },
  { src: "/whitesvgs/girl.svg", left: 81.5, top: 61.7, size: 62, rotate: -4 },
  { src: "/whitesvgs/hold6.svg", left: 27.2, top: 44.4, size: 32 },
];

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Canvas locked to the window size at first load — icons never reposition
  // as the viewport shrinks, they just get cropped by the edges (like a
  // cropped background), same as a bigger monitor simply seeing more of it.
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

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
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {canvasSize && (
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{ width: canvasSize.width, height: canvasSize.height, transform: "translate(-50%, -50%)" }}
        >
          {decorIcons.map((icon, i) => (
            <img
              key={`${icon.src}-${i}`}
              src={icon.src}
              alt=""
              className="pointer-events-none select-none absolute"
              style={{
                left: `${icon.left}%`,
                top: `${icon.top}%`,
                width: icon.size,
                height: icon.size,
                transform: `translate(-50%, -50%) rotate(${icon.rotate ?? 0}deg)`,
              }}
            />
          ))}
        </div>
      )}
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-gwcc-gold font-semibold tracking-widest text-xs uppercase">
            GW Climbing Club
          </span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Admin Access</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="bg-card border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-gwcc-gold"
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
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
