import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import NavMenuButton from "./NavMenuButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 bg-gwcc-navy border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-gwcc-gold font-bold tracking-wide text-sm hover:opacity-70 transition-opacity"
          >
            GWCC
          </button>
        </form>
        <NavMenuButton role={session.user.role} />
      </header>

      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
