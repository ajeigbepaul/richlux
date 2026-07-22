"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FaCheck, FaBan, FaUndo, FaEye, FaTrash } from "react-icons/fa";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function ViewModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md space-y-3 richshadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900 dark:text-white">{row.username}</h2>
          <Badge status={row.agentApplication?.status} />
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500 dark:text-surface-400">Email</dt>
            <dd className="text-ink-900 dark:text-white text-right">{row.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500 dark:text-surface-400">Phone</dt>
            <dd className="text-ink-900 dark:text-white text-right">{row.phone || "-"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500 dark:text-surface-400">Role</dt>
            <dd className="text-ink-900 dark:text-white text-right capitalize">{row.role}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500 dark:text-surface-400">Account status</dt>
            <dd className="text-ink-900 dark:text-white text-right">
              {row.isActive ? "Active" : "Suspended"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500 dark:text-surface-400">Applied</dt>
            <dd className="text-ink-900 dark:text-white text-right">
              {row.agentApplication?.appliedAt
                ? new Date(row.agentApplication.appliedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-500 dark:text-surface-400 mb-1">Message</dt>
            <dd className="text-ink-900 dark:text-white whitespace-pre-line">
              {row.agentApplication?.message || "-"}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 rounded-md bg-ink-100 dark:bg-surface-700 text-ink-900 dark:text-white text-sm font-medium py-2 hover:bg-ink-200 dark:hover:bg-surface-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Reuses GET /api/users (already superadmin-gated) rather than a dedicated
// endpoint -- filters down to accounts that have ever applied, same data the
// Users page's role/isActive management pulls from, just scoped to this one
// operation so approving/suspending an agent isn't buried in that table.
export default function AdminAgentApplicationsPage() {
  const { data: session, status } = useSession();
  const isSuperadmin = session?.user?.role === "superadmin";
  const { data, isLoading, mutate } = useSWR(isSuperadmin ? "/api/users" : null, fetcher);
  const [viewingRow, setViewingRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentApplicationStatus: "approved" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to approve application");
      toast.success("Application approved -- they'll get agent access after their next login");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to approve application");
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
      if (!res.ok) throw new Error(body.message || "Failed to update agent");
      toast.success(isActive ? "Agent reactivated" : "Agent suspended");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update agent");
    }
  };

  // Clears the application from this table (agentApplication.status -> "none")
  // without touching their role or account access -- a plain user keeps
  // their login, an already-approved agent keeps working normally.
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentApplicationStatus: "none" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to remove application");
      toast.success("Application removed");
      setDeleteTarget(null);
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to remove application");
    } finally {
      setIsDeleting(false);
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
  const rows = all.filter((row) => row.agentApplication && row.agentApplication.status !== "none");

  function PrimaryAction({ row }) {
    if (row.agentApplication?.status === "approved") {
      return row.isActive ? (
        <button
          type="button"
          onClick={() => handleActiveToggle(row._id, false)}
          title="Suspend"
          className="text-warning hover:underline text-sm font-medium flex items-center gap-1"
        >
          <FaBan size={13} />
          Suspend
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleActiveToggle(row._id, true)}
          title="Reactivate"
          className="text-success hover:underline text-sm font-medium flex items-center gap-1"
        >
          <FaUndo size={13} />
          Reactivate
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => handleApprove(row._id)}
        title="Approve"
        className="text-success hover:underline text-sm font-medium flex items-center gap-1"
      >
        <FaCheck size={13} />
        Approve
      </button>
    );
  }

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (row) => row.phone || "-" },
    {
      key: "message",
      label: "Message",
      render: (row) => (
        <span className="text-sm text-ink-700 dark:text-slate-200 max-w-xs block truncate">
          {row.agentApplication?.message || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge status={row.agentApplication?.status} />,
    },
    {
      key: "appliedAt",
      label: "Applied",
      render: (row) =>
        row.agentApplication?.appliedAt
          ? new Date(row.agentApplication.appliedAt).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-3 justify-end items-center">
          <PrimaryAction row={row} />
          <button
            type="button"
            onClick={() => setViewingRow(row)}
            title="View"
            className="text-brand-500 hover:underline text-sm font-medium flex items-center gap-1"
          >
            <FaEye size={13} />
            View
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            title="Delete"
            className="text-danger hover:underline text-sm font-medium flex items-center gap-1"
          >
            <FaTrash size={13} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Agent Applications" }]}
      />
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">
        Agent Applications
      </h1>
      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row._id}
          emptyMessage="No agent applications yet."
          renderMobileCard={(row) => (
            <div className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{row.username}</p>
                  <p className="text-xs text-ink-500 dark:text-surface-400">{row.email}</p>
                  <p className="text-xs text-ink-500 dark:text-surface-400">{row.phone || "-"}</p>
                </div>
                <Badge status={row.agentApplication?.status} />
              </div>
              {row.agentApplication?.message && (
                <p className="text-sm text-ink-700 dark:text-slate-200 truncate">
                  {row.agentApplication.message}
                </p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-ink-300 dark:border-surface-700">
                <span className="text-xs text-ink-500 dark:text-surface-400">
                  {row.agentApplication?.appliedAt
                    ? new Date(row.agentApplication.appliedAt).toLocaleDateString()
                    : "-"}
                </span>
                <div className="flex gap-3 items-center">
                  <PrimaryAction row={row} />
                  <button
                    type="button"
                    onClick={() => setViewingRow(row)}
                    className="text-brand-500 text-xs font-medium flex items-center gap-1"
                  >
                    <FaEye size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(row)}
                    className="text-danger text-xs font-medium flex items-center gap-1"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}
      <ViewModal row={viewingRow} onClose={() => setViewingRow(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this application?"
        description="This does not delete their account -- it just clears the application from this list."
        confirmLabel="Remove"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
