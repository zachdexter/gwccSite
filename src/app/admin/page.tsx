import { auth } from "@/auth";
import AdminToolGrid from "@/components/AdminToolGrid";

export default async function AdminDashboard() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="max-w-2xl mx-auto pt-4">
      <AdminToolGrid role={role} />
    </div>
  );
}
