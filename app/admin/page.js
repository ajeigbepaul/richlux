"use client";

import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function StatCard({ title, value, subtitle, href, isLoading }) {
  return (
    <Link
      href={href}
      className="block bg-white dark:bg-surface-800 rounded-2xl p-6 richshadow richtrans hover:-translate-y-0.5"
    >
      <p className="text-sm text-ink-500 dark:text-surface-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-ink-900 dark:text-white">
        {isLoading ? "..." : value}
      </p>
      {subtitle && !isLoading && (
        <p className="mt-1 text-xs text-ink-500 dark:text-surface-400">{subtitle}</p>
      )}
    </Link>
  );
}

// Role-aware dashboard, the sidebar's first nav entry for every role -- each
// card's data comes from an endpoint that already exists elsewhere in the
// app (requests list, listings list, users list), no dedicated stats API.
export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const { data: openRequests, isLoading: openRequestsLoading } = useSWR(
    role ? "/api/userrequest?status=open" : null,
    fetcher
  );
  const openRequestsCount = Array.isArray(openRequests) ? openRequests.length : 0;

  // Agents are already scoped to their own listings server-side, so this is
  // "my" listings without needing an explicit agent filter.
  const { data: myListings, isLoading: myListingsLoading } = useSWR(
    role === "agent" ? "/api/listing?pageSize=50" : null,
    fetcher
  );
  const myListingItems = myListings?.items || [];
  const pendingCount = myListingItems.filter((l) => l.approvalStatus === "pending").length;
  const approvedCount = myListingItems.filter((l) => l.approvalStatus === "approved").length;
  const rejectedCount = myListingItems.filter((l) => l.approvalStatus === "rejected").length;

  const { data: pendingListings, isLoading: pendingListingsLoading } = useSWR(
    role === "manager" || role === "superadmin"
      ? "/api/listing?approvalStatus=pending&pageSize=1"
      : null,
    fetcher
  );
  const pendingListingsCount = pendingListings?.total || 0;

  const { data: users, isLoading: usersLoading } = useSWR(
    role === "superadmin" ? "/api/users" : null,
    fetcher
  );
  const usersList = Array.isArray(users) ? users : [];
  const usersCount = usersList.length;
  const pendingApplicationsCount = usersList.filter(
    (u) => u.agentApplication?.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Open Requests"
          value={openRequestsCount}
          isLoading={openRequestsLoading}
          href="/admin/requests"
        />
        {role === "agent" && (
          <StatCard
            title="My Listings"
            value={myListingItems.length}
            subtitle={`${pendingCount} pending · ${approvedCount} approved · ${rejectedCount} rejected`}
            isLoading={myListingsLoading}
            href="/admin/listings"
          />
        )}
        {(role === "manager" || role === "superadmin") && (
          <StatCard
            title="Listings Pending Approval"
            value={pendingListingsCount}
            isLoading={pendingListingsLoading}
            href="/admin/listings?approvalStatus=pending"
          />
        )}
        {role === "superadmin" && (
          <StatCard
            title="Total Users"
            value={usersCount}
            isLoading={usersLoading}
            href="/admin/users"
          />
        )}
        {role === "superadmin" && (
          <StatCard
            title="Pending Agent Applications"
            value={pendingApplicationsCount}
            isLoading={usersLoading}
            href="/admin/agent-applications"
          />
        )}
      </div>
    </div>
  );
}
