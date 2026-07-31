"use client";

import Link from "next/link";
import { ClipboardCheck, Users, CalendarDays, Images, Trophy, Settings, ImagePlay, Clock } from "lucide-react";

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
    description: "Upload & manage photos",
    icon: Images,
  },
  {
    href: "/admin/comp",
    label: "Comp Team",
    description: "Manage comp team members",
    icon: Trophy,
  },
  {
    href: "/admin/hero",
    label: "Home Photos",
    description: "Pick photos for the carousel",
    icon: ImagePlay,
  },
  {
    href: "/admin/practice",
    label: "Practice Times",
    description: "Edit the practice schedule",
    icon: Clock,
  },
];

const settingsTool = {
  href: "/admin/settings",
  label: "Settings",
  description: "Site configuration",
  icon: Settings,
};

interface AdminToolGridProps {
  role?: string;
  onNavigate?: () => void;
}

export default function AdminToolGrid({ role, onNavigate }: AdminToolGridProps) {
  const visibleTools = role === "president" ? [...tools, settingsTool] : tools;

  return (
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
  );
}
