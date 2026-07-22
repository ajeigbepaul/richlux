"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";
import { USER_REQUEST_STATUSES } from "@/constants/request";

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

// Direct, single-listing inquiries -- created when a visitor clicks "Make an
// Inquiry" on a listing (as opposed to the general "Make a Request" wizard,
// which has no listingId). These were previously mixed into /admin/requests
// with a small badge; they're not eligible for the multi-agent offer
// marketplace (see app/admin/requests/[id]/page.js's "Direct Inquiry" card),
// so they get their own oversight-only list here instead. Same role-gating
// pattern as app/admin/users/page.js -- the layout already blocks non-staff
// from /admin entirely, but an agent landing on this specific page should see
// a polite message rather than an empty/broken table.
export default function AdminEnquiriesPage() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const isOversight =
    session?.user?.role === "manager" || session?.user?.role === "superadmin";
  const { data, isLoading, mutate } = useSWR(
    isOversight ? "/api/userrequest?hasListing=true" : null,
    fetcher
  );

  const all = Array.isArray(data) ? data : [];
  const rows = all.slice(page * pageSize, page * pageSize + pageSize);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      const res = await fetch(`/api/userrequest/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update status");
      toast.success("Enquiry status updated");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

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

  const columns = [
    { key: "fullname", label: "Requester", render: (row) => row.fullname || "-" },
    {
      key: "listing",
      label: "Listing",
      render: (row) =>
        row.listingId ? (
          <Link
            href={`/listings/${row.listingId._id || row.listingId}`}
            className="text-brand-400 hover:underline"
          >
            {row.listingId.title || "View listing"}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => LISTING_CATEGORY_LABELS[row.category] || row.category,
    },
    {
      key: "budget",
      label: "Budget",
      align: "right",
      render: (row) => `${formatNaira(row.budgetMin)} – ${formatNaira(row.budgetMax)}`,
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
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries" }]} />
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Enquiries</h1>
      {isLoading ? (
        <TableSkeleton columns={6} />
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
          emptyMessage="No enquiries yet."
          renderMobileCard={(row) => (
            <div className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{row.fullname}</p>
                  <p className="text-xs text-ink-500 dark:text-surface-400">
                    {LISTING_CATEGORY_LABELS[row.category] || row.category}
                  </p>
                  {row.listingId && (
                    <Link
                      href={`/listings/${row.listingId._id || row.listingId}`}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      {row.listingId.title || "View listing"}
                    </Link>
                  )}
                </div>
                <Badge status={row.status} />
              </div>
              <div className="text-sm text-ink-500 dark:text-surface-300">
                {formatNaira(row.budgetMin)} – {formatNaira(row.budgetMax)}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-ink-300 dark:border-surface-700">
                <StatusSelect
                  className="text-xs bg-ink-100 dark:bg-surface-900 text-ink-900 dark:text-white border border-ink-300 dark:border-surface-600 rounded px-1 py-0.5"
                  value={row.status}
                  onChange={(e) => handleStatusChange(row._id, e.target.value)}
                />
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
