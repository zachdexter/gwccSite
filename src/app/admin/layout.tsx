import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import NavMenuButton from "./NavMenuButton";
import BackButton from "./BackButton";
import { AdminRoleProvider } from "@/components/AdminRoleContext";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <AdminRoleProvider role={session.user.role}>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-20 bg-gwcc-navy border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gwcc-gold font-bold tracking-wide text-sm hover:opacity-70 transition-opacity"
            >
              Home
            </Link>
            <BackButton />
          </div>
          <NavMenuButton />
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>

        <footer className="px-4 py-3 text-right text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          Something broken, or a question about how this site works?{" "}
          <a href="mailto:zsdexter05@gmail.com" className="underline underline-offset-2">
            Email Zach Dexter (&apos;26-&apos;27 VP)
          </a>
        </footer>
      </div>
    </AdminRoleProvider>
  );
}
