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
  { src: "/navysvgs/beaniedude2.svg", left: 23.4, top: 89.3, size: 86 },
  { src: "/navysvgs/helmet.svg", left: 90.2, top: 16.1, size: 63 },
  { src: "/navysvgs/climbstar.svg", left: 43.6, top: 28.2, size: 87 },
  { src: "/navysvgs/rockon.svg", left: 67.3, top: 65.8, size: 55 },
  { src: "/navysvgs/star20.svg", left: 15.9, top: 54.2, size: 32 },
  { src: "/navysvgs/star14.svg", left: 61.9, top: 32.0, size: 32 },
  { src: "/navysvgs/star17.svg", left: 92.5, top: 87.0, size: 32 },
  { src: "/navysvgs/star19.svg", left: 52.9, top: 83.0, size: 32 },
  { src: "/navysvgs/star16.svg", left: 78.2, top: 16.1, size: 32 },
  { src: "/navysvgs/star13.svg", left: 26.9, top: 24.3, size: 32 },
  { src: "/navysvgs/star15.svg", left: 81.0, top: 53.9, size: 32 },
  { src: "/navysvgs/star6.svg", left: 6.2, top: 87.9, size: 32 },
  { src: "/navysvgs/mountain.svg", left: 81.6, top: 91.7, size: 68 },
  { src: "/navysvgs/hold6.svg", left: 75.6, top: 41.9, size: 32 },
  { src: "/navysvgs/hold1.svg", left: 9.7, top: 41.1, size: 32 },
  { src: "/navysvgs/hold10.svg", left: 55.4, top: 67.2, size: 32 },
  { src: "/navysvgs/star9.svg", left: 44.5, top: 8.3, size: 32 },
  { src: "/navysvgs/hold11.svg", left: 25.9, top: 64.3, size: 32 },
  { src: "/navysvgs/girl.svg", left: 9.4, top: 13.6, size: 65 },
  { src: "/navysvgs/star3.svg", left: 40.8, top: 69.5, size: 32 },
  { src: "/navysvgs/hold1.svg", left: 59.3, top: 23.1, size: 32, rotate: -50 },
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
