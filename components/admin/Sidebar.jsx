"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Nav is role-scoped. Requests are visible to all staff roles now (agents
// and managers respond to them with offers); user management stays
// superadmin-only. Enquiries (direct, single-listing inquiries -- not
// eligible for the multi-agent offer marketplace) are oversight-only
// (manager/superadmin), matching who can actually act on them.
const NAV_BY_ROLE = {
  agent: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/listings", label: "My Listings" },
    { href: "/admin/requests", label: "Requests" },
  ],
  manager: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/listings", label: "All Listings" },
    { href: "/admin/requests", label: "Requests" },
    { href: "/admin/enquiries", label: "Enquiries" },
  ],
  superadmin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/listings", label: "All Listings" },
    { href: "/admin/requests", label: "Requests" },
    { href: "/admin/enquiries", label: "Enquiries" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/agent-applications", label: "Agent Applications" },
  ],
};

function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;
  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-ink-100 dark:bg-surface-950 border-b lg:border-b-0 lg:border-r border-ink-300 dark:border-surface-700 flex flex-col lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto">
      <div className="p-4 sm:p-6 flex items-center justify-between lg:block">
        <Link href="/admin" className="text-lg font-bold text-ink-900 dark:text-white">
          Richlux <span className="text-brand-400">Admin</span>
        </Link>
        {session?.user && (
          <p className="text-xs text-ink-500 dark:text-surface-400 mt-0 lg:mt-1 capitalize">
            {session.user.role} &middot; {session.user.name || session.user.email}
          </p>
        )}
      </div>

      <nav className="px-2 sm:px-4 pb-2 lg:pb-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:flex-1">
        {navItems.map((item) => {
          // "/admin" itself must only match exactly -- otherwise its prefix
          // check would also match every other /admin/* route below it.
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium richtrans ${
                active
                  ? "bg-brand-400/10 text-brand-400 richshadow sidenav-active"
                  : "text-ink-500 dark:text-surface-300 hover:bg-ink-200 dark:hover:bg-surface-800 hover:text-ink-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 sm:p-6 border-t border-ink-300 dark:border-surface-800 flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-2">
        <div className="flex items-center justify-between lg:justify-start gap-2 lg:mb-2 order-first lg:order-none">
          <span className="text-sm text-ink-500 dark:text-surface-300 lg:hidden">Theme</span>
          <ThemeToggle className="text-ink-500 dark:text-surface-300 hover:bg-ink-200 dark:hover:bg-surface-800" />
        </div>
        <Link href="/" className="text-sm text-ink-500 dark:text-surface-300 hover:text-brand-400 richtrans">
          Back to site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm font-medium text-left text-danger hover:opacity-80 richtrans"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
