"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Alert = {
  id: number;
  message: string;
  expiresAt: string;
};

export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Alert[]) => setAlerts(data));
  }, []);

  function dismiss(id: number) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  if (alerts.length === 0) return null;

  return (
    <div className="absolute top-6 left-0 right-0 z-20 w-full max-w-2xl mx-auto px-6 space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 bg-gwcc-dark border-2 border-gwcc-gold rounded-md px-4 py-3 text-left shadow-[0_0_16px_rgba(219,210,155,0.25)]"
        >
          <p className="flex-1 text-gwcc-light text-sm">{a.message}</p>
          <button
            onClick={() => dismiss(a.id)}
            aria-label="Dismiss alert"
            className="text-gwcc-light/50 hover:text-gwcc-light transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
