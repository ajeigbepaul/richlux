"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
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
export default function AdminListingsPage() {
  const [page, setPage] = useState(0); // zero-based, matches MUI TablePagination
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, mutate } = useSWR(
    `/api/listing?page=${page + 1}&pageSize=${pageSize}`,
    fetcher
  );

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

  const columns = [
    { key: "title", label: "Title", render: (row) => row.title },
    {
      key: "category",
      label: "Category",
      render: (row) => LISTING_CATEGORY_LABELS[row.category] || row.category,
    },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center rounded-md bg-brand-400 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 transition-colors richtrans"
        >
          + New Listing
        </Link>
      </div>

      {isLoading ? (
        <p className="text-ink-500 dark:text-surface-400">Loading listings...</p>
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
                <Badge status={row.status} />
              </div>
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
