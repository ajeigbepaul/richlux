"use client";

import { useSession } from "next-auth/react";
import Spinner from "@/components/ui/Spinner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import BannerManager from "@/components/admin/BannerManager";

// Site-wide homepage content, not agent-specific -- same oversight-only
// gating as /admin/users (the layout already blocks non-staff from /admin
// entirely, but an agent landing on this specific page should see a polite
// message rather than an empty/broken screen).
export default function AdminBannersPage() {
  const { data: session, status } = useSession();
  const isOversight =
    session?.user?.role === "manager" || session?.user?.role === "superadmin";

  if (status === "loading") {
    return <Spinner className="text-brand-400 py-10" />;
  }

  if (!isOversight) {
    return (
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 text-ink-500 dark:text-surface-300 richshadow">
        You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Banners" }]} />
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Banners</h1>
      <BannerManager />
    </div>
  );
}
