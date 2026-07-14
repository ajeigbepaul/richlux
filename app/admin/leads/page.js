"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const STATUS_OPTIONS = [
  { value: "open", name: "Open" },
  { value: "contacted", name: "Contacted" },
  { value: "closed", name: "Closed" },
];

function formatNaira(amount) {
  return `₦ ${Number(amount || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function truncate(text, limit = 12) {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length <= limit) return text;
  return `${words.slice(0, limit).join(" ")}...`;
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
// same approach the old components/ListingTable.jsx used.
export default function AdminLeadsPage() {
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
      toast.success("Lead status updated");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const columns = [
    { key: "fullname", label: "Fullname" },
    { key: "location", label: "Location", render: (row) => row.intendinglocation || "-" },
    { key: "bed", label: "Bed", render: (row) => row.bed || "-" },
    { key: "type", label: "Type", render: (row) => row.type || "-" },
    { key: "request", label: "Request", render: (row) => truncate(row.request) },
    {
      key: "budget",
      label: "Budget",
      align: "right",
      render: (row) => formatNaira(row.budget),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge status={row.status} />
          <StatusSelect
            value={row.status}
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (row) => (
        <Link href={`/admin/leads/${row._id}`} className="text-brand-400 hover:underline text-sm font-medium">
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Leads</h1>
      {isLoading ? (
        <p className="text-ink-500 dark:text-surface-400">Loading leads...</p>
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
          emptyMessage="No leads yet."
          renderMobileCard={(row) => (
            <div className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
              <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-ink-900 dark:text-white">{row.fullname}</p>
                <Badge status={row.status} />
              </div>
              <p className="text-sm text-ink-500 dark:text-surface-300">{row.intendinglocation}</p>
              <p className="text-sm text-ink-500 dark:text-surface-400">{truncate(row.request, 20)}</p>
              <div className="flex justify-between text-sm text-ink-500 dark:text-surface-300">
                <span>{formatNaira(row.budget)}</span>
                <span>
                  {row.bed} bed &middot; {row.type}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-ink-300 dark:border-surface-700">
                <StatusSelect
                  className="text-xs bg-ink-100 dark:bg-surface-900 text-ink-900 dark:text-white border border-ink-300 dark:border-surface-600 rounded px-1 py-0.5"
                  value={row.status}
                  onChange={(e) => handleStatusChange(row._id, e.target.value)}
                />
                <Link href={`/admin/leads/${row._id}`} className="text-brand-400 text-sm font-medium">
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
