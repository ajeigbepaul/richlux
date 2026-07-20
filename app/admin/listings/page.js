"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

// Note: the API already scopes an authenticated agent to `agent: session.user.id`
// server-side, and managers/superadmins see everything by default -- no
// client-side role filtering needed here.
function AdminListingsBrowser() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isOversight =
    session?.user?.role === "manager" || session?.user?.role === "superadmin";

  const [approvalFilter, setApprovalFilter] = useState(
    () => searchParams.get("approvalStatus") || ""
  );
  const [page, setPage] = useState(0); // zero-based, matches MUI TablePagination
  const [pageSize, setPageSize] = useState(10);

  const query = new URLSearchParams();
  query.set("page", String(page + 1));
  query.set("pageSize", String(pageSize));
  if (approvalFilter) query.set("approvalStatus", approvalFilter);

  const { data, isLoading, mutate } = useSWR(`/api/listing?${query}`, fetcher);

  const items = data?.items || [];
  const total = data?.total || 0;

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing? This also removes its media from Cloudinary.")) {
      return;
    }
    try {
      const res = await fetch(`/api/listing/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to delete listing");
      toast.success("Listing deleted");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to delete listing");
    }
  };

  const handleApproval = async (id, approvalStatus) => {
    try {
      const res = await fetch(`/api/listing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update listing");
      toast.success(approvalStatus === "approved" ? "Listing approved" : "Listing rejected");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update listing");
    }
  };

  const setFilter = (value) => {
    setApprovalFilter(value);
    setPage(0);
  };

  const columns = [
    { key: "title", label: "Title", render: (row) => row.title },
    {
      key: "category",
      label: "Category",
      render: (row) => LISTING_CATEGORY_LABELS[row.category] || row.category,
    },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
    {
      key: "approvalStatus",
      label: "Approval",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge status={row.approvalStatus} />
          {isOversight && row.approvalStatus === "pending" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleApproval(row._id, "approved")}
                className="text-success hover:underline text-xs font-medium"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleApproval(row._id, "rejected")}
                className="text-danger hover:underline text-xs font-medium"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (row) => formatNaira(row.price),
    },
    { key: "agent", label: "Agent", render: (row) => row.agent?.username || "-" },
    {
      key: "media",
      label: "Media",
      align: "right",
      render: (row) => row.media?.length || 0,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-3 justify-end">
          <Link
            href={`/admin/listings/${row._id}/edit`}
            className="text-brand-400 hover:underline text-sm font-medium"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            className="text-danger hover:underline text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Listings" }]} />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center rounded-md bg-brand-400 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 transition-colors richtrans"
        >
          + New Listing
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !approvalFilter
              ? "bg-brand-400 text-white"
              : "bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 border border-ink-300 dark:border-surface-700"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            approvalFilter === "pending"
              ? "bg-brand-400 text-white"
              : "bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 border border-ink-300 dark:border-surface-700"
          }`}
        >
          Pending Approval
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={7} />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          getRowId={(row) => row._id}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          emptyMessage="No listings yet -- create the first one."
          renderMobileCard={(row) => (
            <div className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{row.title}</p>
                  <p className="text-xs text-ink-500 dark:text-surface-400">
                    {LISTING_CATEGORY_LABELS[row.category] || row.category}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge status={row.status} />
                  <Badge status={row.approvalStatus} />
                </div>
              </div>
              {isOversight && row.approvalStatus === "pending" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleApproval(row._id, "approved")}
                    className="text-success text-xs font-medium"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproval(row._id, "rejected")}
                    className="text-danger text-xs font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
              <div className="text-sm text-ink-500 dark:text-surface-300 flex justify-between">
                <span>{formatNaira(row.price)}</span>
                <span>{row.media?.length || 0} media</span>
              </div>
              <div className="text-sm text-ink-500 dark:text-surface-400">
                Agent: {row.agent?.username || "-"}
              </div>
              <div className="flex gap-4 pt-2 border-t border-ink-300 dark:border-surface-700">
                <Link
                  href={`/admin/listings/${row._id}/edit`}
                  className="text-brand-400 text-sm font-medium"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(row._id)}
                  className="text-danger text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}

export default function AdminListingsPage() {
  return (
    <Suspense fallback={null}>
      <AdminListingsBrowser />
    </Suspense>
  );
}
