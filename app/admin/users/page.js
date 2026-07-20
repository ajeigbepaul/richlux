"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import Spinner from "@/components/ui/Spinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { USER_ROLES } from "@/constants/listing";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

// The admin layout already blocks non-staff from /admin entirely, but a
// manager/agent hitting this specific page should see a polite message
// rather than a 403 flowing through a raw fetch -- so the role check happens
// client-side here, before the request is even made.
//
// Agent-application review/approval lives on its own page
// (/admin/agent-applications) rather than as a column here -- keeps this
// table focused on role/active management.
export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const isSuperadmin = session?.user?.role === "superadmin";
  const { data, isLoading, mutate } = useSWR(isSuperadmin ? "/api/users" : null, fetcher);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update role");
      toast.success("Role updated");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleActiveToggle = async (id, isActive) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update user");
      toast.success(isActive ? "User activated" : "User deactivated");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update user");
    }
  };

  if (status === "loading") {
    return <Spinner className="text-brand-400 py-10" />;
  }

  if (!isSuperadmin) {
    return (
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 text-ink-500 dark:text-surface-300 richshadow">
        You are not authorized to view this page.
      </div>
    );
  }

  const all = Array.isArray(data) ? data : [];
  const rows = all.slice(page * pageSize, page * pageSize + pageSize);

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <select
          className="text-xs bg-white dark:bg-surface-800 text-ink-900 dark:text-white border border-ink-300 dark:border-surface-600 rounded px-1 py-0.5 capitalize"
          value={row.role}
          onChange={(e) => handleRoleChange(row._id, e.target.value)}
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "isActive",
      label: "Active",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!row.isActive}
          onChange={(e) => handleActiveToggle(row._id, e.target.checked)}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Users" }]} />
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Users</h1>
      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row._id}
          page={page}
          pageSize={pageSize}
          total={all.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          emptyMessage="No users yet."
          renderMobileCard={(row) => (
            <div className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{row.username}</p>
                  <p className="text-xs text-ink-500 dark:text-surface-400">{row.email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!row.isActive}
                  onChange={(e) => handleActiveToggle(row._id, e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-ink-300 dark:border-surface-700">
                <select
                  className="text-xs bg-ink-100 dark:bg-surface-900 text-ink-900 dark:text-white border border-ink-300 dark:border-surface-600 rounded px-1 py-0.5 capitalize"
                  value={row.role}
                  onChange={(e) => handleRoleChange(row._id, e.target.value)}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-ink-500 dark:text-surface-400">
                  {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
