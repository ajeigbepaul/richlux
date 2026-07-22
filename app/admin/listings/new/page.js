"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ListingForm from "@/components/admin/ListingForm";

export default function NewListingPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to create listing");
      toast.success("Listing created");
      router.push("/admin/listings");
    } catch (error) {
      toast.error(error.message || "Failed to create listing");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Listings", href: "/admin/listings" },
          { label: "New Listing" },
        ]}
      />
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">New Listing</h1>
      <ListingForm onSubmit={handleSubmit} isSaving={isSaving} submitLabel="Create Listing" />
    </div>
  );
}
