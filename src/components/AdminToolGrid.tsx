"use client";

import Link from "next/link";
import { ClipboardCheck, Users, CalendarDays, Images, Trophy, Settings, Clock, Star, Megaphone, LogOut } from "lucide-react";
import { useAdminRole } from "@/components/AdminRoleContext";
import { signOut } from "next-auth/react";

const tools = [
  {
    href: "/admin/attendance",
    label: "Check-in",
    description: "Log member attendance",
    icon: ClipboardCheck,
  },
  {
    href: "/admin/members",
    label: "Members",
    description: "Manage the roster",
    icon: Users,
  },
  {
    href: "/admin/semesters",
    label: "Semesters",
    description: "Set the active semester",
    icon: CalendarDays,
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    description: "Sync from Drive & pick cover photos",
    icon: Images,
  },
  {
    href: "/admin/comp",
    label: "Comp Team",
    description: "Manage comp team members",
    icon: Trophy,
  },
  {
    href: "/admin/eboard",
    label: "Eboard",
    description: "Manage eboard roster",
    icon: Star,
  },
  {
    href: "/admin/practice",
    label: "Practice Times",
    description: "Edit the practice schedule",
    icon: Clock,
  },
  {
    href: "/admin/alerts",
    label: "Alerts",
    description: "Post homepage announcements",
    icon: Megaphone,
  },
];

const settingsTool = {
  href: "/admin/settings",
  label: "Settings",
  description: "Site configuration",
  icon: Settings,
};

interface AdminToolGridProps {
  onNavigate?: () => void;
}

export default function AdminToolGrid({ onNavigate }: AdminToolGridProps) {
  const role = useAdminRole();
  const visibleTools = role === "president" ? [...tools, settingsTool] : tools;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleTools.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-gwcc-gold/30 p-6 text-center transition-colors group"
          >
            <Icon className="w-8 h-8 text-gwcc-gold/80 group-hover:text-gwcc-gold transition-colors" />
            <div>
              <p className="text-card-foreground font-semibold text-sm">{label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          signOut({ callbackUrl: "/" });
        }}
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-card hover:bg-muted hover:border-destructive/30 p-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
