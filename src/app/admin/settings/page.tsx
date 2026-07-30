import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "president") redirect("/admin");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage login passwords</p>
      </div>
      <SettingsForm />
    </div>
  );
}
