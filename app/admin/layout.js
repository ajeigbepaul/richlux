import { redirect } from "next/navigation";
import { getCurrentSession } from "@/utils/auth";
import Sidebar from "@/components/admin/Sidebar";

const ADMIN_ROLES = ["superadmin", "manager", "agent"];

export const metadata = {
  title: "Richlux Admin",
};

// Server Component gate: this is the only enforcement for /admin/* until
// middleware.js is added separately -- so it must actually redirect, not
// just silently render blank for the wrong role.
export default async function AdminLayout({ children }) {
  const session = await getCurrentSession();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 text-ink-900 dark:text-white flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
