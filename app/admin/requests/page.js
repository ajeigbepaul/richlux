"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";
import { MOVE_IN_TIMEFRAME_LABELS, USER_REQUEST_STATUSES } from "@/constants/request";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const STATUS_OPTIONS = USER_REQUEST_STATUSES.map((value) => ({
  value,
  name: value.charAt(0).toUpperCase() + value.slice(1),
}));

function formatNaira(amount) {
  return `₦ ${Number(amount || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function StatusSelect({ value, onChange, className }) {
  return (
    <select
      className={
        className ||
        "text-xs bg-white dark:bg-surface-800 text-ink-900 dark:text-white border border-ink-300 dark:border-surface-600 rounded px-1 py-0.5"
      }
      value={value}
      onChange={onChange}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}

// GET /api/userrequest returns a plain array (not paginated), so pagination
// here is client-side: slice the array ourselves based on local page state,
// matching app/admin/leads/page.js (which this route replaces). Staff-only
// endpoint (superadmin/manager/agent); agents only get a read-only status
// badge since PATCH /api/userrequest/[id] is manager/superadmin-only server-side.
export default function AdminRequestsPage() {
  const { data: session } = useSession();
  const canEditStatus =
    session?.user?.role === "manager" || session?.user?.role === "superadmin";

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, mutate } = useSWR("/api/userrequest", fetcher);

  const all = Array.isArray(data) ? data : [];
  const rows = all.slice(page * pageSize, page * pageSize + pageSize);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/userrequest/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update status");
      toast.success("Request status updated");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const columns = [
    { key: "fullname", label: "Requester", render: (row) => row.fullname || "-" },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{LISTING_CATEGORY_LABELS[row.category] || row.category}</span>
          {row.listingId && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              Direct inquiry
            </span>
          )}
        </div>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      align: "right",
      render: (row) => `${formatNaira(row.budgetMin)} – ${formatNaira(row.budgetMax)}`,
    },
    { key: "bedrooms", label: "Bedrooms", render: (row) => row.bedrooms ?? "-" },
    {
      key: "moveIn",
      label: "Move-in",
      render: (row) => MOVE_IN_TIMEFRAME_LABELS[row.moveInTimeframe] || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge status={row.status} />
          {canEditStatus && (
            <StatusSelect
              value={row.status}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
            />
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (row) => (
        <Link
          href={`/admin/requests/${row._id}`}
          className="text-brand-400 hover:underline text-sm font-medium"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Requests</h1>
      {isLoading ? (
        <p className="text-ink-500 dark:text-surface-400">Loading requests...</p>
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
          emptyMessage="No requests yet."
          renderMobileCard={(row) => (
            <div className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{row.fullname}</p>
                  <p className="text-xs text-ink-500 dark:text-surface-400 flex items-center gap-2">
                    {LISTING_CATEGORY_LABELS[row.category] || row.category}
                    {row.listingId && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                        Direct inquiry
                      </span>
                    )}
                  </p>
                </div>
                <Badge status={row.status} />
              </div>
              <div className="text-sm text-ink-500 dark:text-surface-300 flex justify-between">
                <span>
                  {formatNaira(row.budgetMin)} – {formatNaira(row.budgetMax)}
                </span>
                <span>
                  {row.bedrooms ?? "-"} bed
                </span>
              </div>
              <p className="text-sm text-ink-500 dark:text-surface-400">
                Move-in: {MOVE_IN_TIMEFRAME_LABELS[row.moveInTimeframe] || "-"}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-ink-300 dark:border-surface-700">
                {canEditStatus ? (
                  <StatusSelect
                    className="text-xs bg-ink-100 dark:bg-surface-900 text-ink-900 dark:text-white border border-ink-300 dark:border-surface-600 rounded px-1 py-0.5"
                    value={row.status}
                    onChange={(e) => handleStatusChange(row._id, e.target.value)}
                  />
                ) : (
                  <span />
                )}
                <Link href={`/admin/requests/${row._id}`} className="text-brand-400 text-sm font-medium">
                  View
                </Link>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
