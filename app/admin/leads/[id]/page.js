"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function formatNaira(amount) {
  return `₦ ${Number(amount || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

// Replaces the old stub app/userrequest/[id]/page.js, which just rendered the
// raw id. There is no GET-by-id endpoint (only PATCH was added for status
// updates), so this reuses the same /api/userrequest list the leads table
// already fetches -- SWR's shared cache makes this instant when navigating
// from the list, and a normal fetch when the URL is opened directly.
export default function LeadDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useSWR("/api/userrequest", fetcher);
  const lead = Array.isArray(data) ? data.find((item) => item._id === id) : null;

  if (isLoading) {
    return <p className="text-ink-500 dark:text-surface-400">Loading lead...</p>;
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <p className="text-danger">Lead not found.</p>
        <Link href="/admin/leads" className="text-brand-400 hover:underline text-sm">
          Back to Leads
        </Link>
      </div>
    );
  }

  const fields = [
    ["Full name", lead.fullname],
    ["Email", lead.email],
    ["Phone", lead.phonenumber],
    ["Sex", lead.sex],
    ["Present location", lead.presentlocation],
    ["Intending location", lead.intendinglocation],
    ["Type", lead.type],
    ["Bed", lead.bed],
    ["Budget", formatNaira(lead.budget)],
    ["Created", lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "-"],
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Lead Details</h1>
        <Badge status={lead.status} />
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 richshadow">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-ink-500 dark:text-surface-400">{label}</dt>
              <dd className="text-ink-900 dark:text-white mt-0.5">{value || "-"}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 pt-4 border-t border-ink-300 dark:border-surface-700">
          <dt className="text-xs uppercase tracking-wide text-ink-500 dark:text-surface-400">Request</dt>
          <dd className="text-ink-900 dark:text-white mt-0.5 whitespace-pre-wrap">{lead.request}</dd>
        </div>
      </div>

      <Link href="/admin/leads" className="text-brand-400 hover:underline text-sm inline-block">
        Back to Leads
      </Link>
    </div>
  );
}
