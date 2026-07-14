"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/ui/Button";
import MediaUploader from "@/components/admin/MediaUploader";
import {
  LISTING_CATEGORIES,
  LISTING_CATEGORY_LABELS,
  LISTING_STATUSES,
  LISTING_PRICE_FREQUENCIES,
} from "@/constants/listing";

const categoryOptions = LISTING_CATEGORIES.map((value) => ({
  value,
  name: LISTING_CATEGORY_LABELS[value] || value,
}));
const statusOptions = LISTING_STATUSES.map((value) => ({
  value,
  name: value.replace("-", " "),
}));
const frequencyOptions = LISTING_PRICE_FREQUENCIES.map((value) => ({
  value,
  name: value.replace("-", " "),
}));

const emptyForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  priceFrequency: "one-time",
  location: { address: "", city: "", state: "Oyo" },
  bedrooms: "",
  bathrooms: "",
  landSize: "",
  amenities: "",
  status: "available",
  isFeatured: false,
  media: [],
};

function toFormState(listing) {
  if (!listing) return emptyForm;
  return {
    title: listing.title || "",
    description: listing.description || "",
    category: listing.category || "",
    price: listing.price ?? "",
    priceFrequency: listing.priceFrequency || "one-time",
    location: {
      address: listing.location?.address || "",
      city: listing.location?.city || "",
      state: listing.location?.state || "Oyo",
    },
    bedrooms: listing.bedrooms ?? "",
    bathrooms: listing.bathrooms ?? "",
    landSize: listing.landSize || "",
    amenities: (listing.amenities || []).join(", "),
    status: listing.status || "available",
    isFeatured: !!listing.isFeatured,
    media: listing.media || [],
  };
}

// Plain-styled input for schema-optional fields (bedrooms/bathrooms/landSize/
// amenities) -- components/Input.jsx hardcodes the `required` attribute,
// which is right for auth forms but would block submitting a listing that
// intentionally leaves these blank (they are not required by model/Listing.js).
function OptionalField({ label, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 dark:text-surface-300 mb-1">{label}</label>
      <input
        className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-600 bg-white dark:bg-surface-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
        {...props}
      />
    </div>
  );
}

// Shared by app/admin/listings/new/page.js and app/admin/listings/[id]/edit/page.js.
// The edit page only ever mounts this once `initialListing` has finished
// loading (it renders a "Loading..." state until then), so the useState
// lazy initializer below is enough -- no effect-based re-sync needed, which
// also avoids clobbering in-progress edits if the underlying SWR data
// happens to revalidate while the form is open.
function ListingForm({ initialListing, onSubmit, isSaving, submitLabel = "Save Listing" }) {
  const [form, setForm] = useState(() => toFormState(initialListing));

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateLocation = (field, value) =>
    setForm((f) => ({ ...f, location: { ...f.location, [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      priceFrequency: form.priceFrequency,
      location: form.location,
      bedrooms: form.bedrooms === "" ? undefined : Number(form.bedrooms),
      bathrooms: form.bathrooms === "" ? undefined : Number(form.bathrooms),
      landSize: form.landSize,
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: form.status,
      isFeatured: form.isFeatured,
      media: form.media,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 sm:p-6 space-y-4">
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-surface-300 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-600 bg-white dark:bg-surface-900 text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[120px]"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            options={statusOptions}
            placeholder="Select status"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Price (NGN)"
            type="number"
            name="price"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
          <Select
            label="Price Frequency"
            name="priceFrequency"
            value={form.priceFrequency}
            onChange={(e) => update("priceFrequency", e.target.value)}
            options={frequencyOptions}
            placeholder="Select frequency"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Address"
            name="address"
            value={form.location.address}
            onChange={(e) => updateLocation("address", e.target.value)}
          />
          <Input
            label="City"
            name="city"
            value={form.location.city}
            onChange={(e) => updateLocation("city", e.target.value)}
          />
          <Input
            label="State"
            name="state"
            value={form.location.state}
            onChange={(e) => updateLocation("state", e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <OptionalField
            label="Bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
          />
          <OptionalField
            label="Bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
          />
          <OptionalField
            label="Land Size"
            value={form.landSize}
            onChange={(e) => update("landSize", e.target.value)}
          />
        </div>
        <OptionalField
          label="Amenities (comma-separated)"
          value={form.amenities}
          onChange={(e) => update("amenities", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-surface-300">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => update("isFeatured", e.target.checked)}
          />
          Featured listing
        </label>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Media</h2>
        <MediaUploader value={form.media} onChange={(media) => update("media", media)} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isSaving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default ListingForm;
