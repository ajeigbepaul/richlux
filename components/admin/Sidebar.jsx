"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// Nav is role-scoped: agents only ever manage their own listings, leads and
// user management are internal-business data manager/superadmin should see.
const NAV_BY_ROLE = {
  agent: [{ href: "/admin/listings", label: "My Listings" }],
  manager: [
    { href: "/admin/listings", label: "All Listings" },
    { href: "/admin/leads", label: "Leads" },
  ],
  superadmin: [
    { href: "/admin/listings", label: "All Listings" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/users", label: "Users" },
  ],
};

function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;
  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-surface-950 border-b lg:border-b-0 lg:border-r border-surface-700 flex flex-col">
      <div className="p-4 sm:p-6 flex items-center justify-between lg:block">
        <Link href="/admin" className="text-lg font-bold text-white">
          Richlux <span className="text-brand-400">Admin</span>
        </Link>
        {session?.user && (
          <p className="text-xs text-surface-400 mt-0 lg:mt-1 capitalize">
            {session.user.role} &middot; {session.user.name || session.user.email}
          </p>
        )}
      </div>

      <nav className="px-2 sm:px-4 pb-2 lg:pb-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium richtrans ${
                active
                  ? "bg-brand-400/10 text-brand-400 richshadow"
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 sm:p-6 border-t border-surface-800 flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-2">
        <Link href="/" className="text-sm text-surface-300 hover:text-brand-400 richtrans">
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
