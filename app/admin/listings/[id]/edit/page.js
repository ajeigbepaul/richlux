"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import ListingForm from "@/components/admin/ListingForm";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

// Next.js 16 makes `params` a Promise in Server Components, but this is a
// client form page, so useParams() (synchronous in client components) is used
// instead of awaiting a params prop.
export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { data: listing, isLoading, error } = useSWR(
    id ? `/api/listing/${id}` : null,
    fetcher
  );

  const handleSubmit = async (payload) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/listing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update listing");
      toast.success("Listing updated");
      router.push("/admin/listings");
    } catch (submitError) {
      toast.error(submitError.message || "Failed to update listing");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Edit Listing</h1>
      {isLoading ? (
        <p className="text-ink-500 dark:text-surface-400">Loading listing...</p>
      ) : error || listing?.message === "Not found" ? (
        <p className="text-danger">Could not load this listing.</p>
      ) : (
        <ListingForm
          initialListing={listing}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}
