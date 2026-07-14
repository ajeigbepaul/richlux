"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/ui/Button";
import MediaUploader from "@/components/admin/MediaUploader";
import { LISTING_PRICE_FREQUENCIES } from "@/constants/listing";

const frequencyOptions = LISTING_PRICE_FREQUENCIES.map((value) => ({
  value,
  name: value.replace("-", " "),
}));

const emptyForm = {
  title: "",
  description: "",
  price: "",
  priceFrequency: "one-time",
  location: { address: "", city: "", state: "Oyo" },
  bedrooms: "",
  bathrooms: "",
  media: [],
};

function toFormState(offer) {
  if (!offer) return emptyForm;
  return {
    title: offer.title || "",
    description: offer.description || "",
    price: offer.price ?? "",
    priceFrequency: offer.priceFrequency || "one-time",
    location: {
      address: offer.location?.address || "",
      city: offer.location?.city || "",
      state: offer.location?.state || "Oyo",
    },
    bedrooms: offer.bedrooms ?? "",
    bathrooms: offer.bathrooms ?? "",
    media: offer.media || [],
  };
}

// Plain-styled input for schema-optional fields (bedrooms/bathrooms) -- mirrors
// components/admin/ListingForm.jsx's local OptionalField helper, since
// components/Input.jsx hardcodes the `required` attribute.
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

// Submitted by agents/managers responding to an open, marketplace-eligible
// UserRequest. `existingOffer` present => edit lane (PATCH, owner-only, only
// while still pending); absent => create lane (POST with requestId).
function OfferForm({ requestId, existingOffer, onSuccess }) {
  const [form, setForm] = useState(() => toFormState(existingOffer));
  const [isSaving, setIsSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateLocation = (field, value) =>
    setForm((f) => ({ ...f, location: { ...f.location, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      priceFrequency: form.priceFrequency,
      location: form.location,
      bedrooms: form.bedrooms === "" ? undefined : Number(form.bedrooms),
      bathrooms: form.bathrooms === "" ? undefined : Number(form.bathrooms),
      media: form.media,
    };
    if (!existingOffer) {
      payload.requestId = requestId;
    }

    setIsSaving(true);
    try {
      const url = existingOffer ? `/api/offers/${existingOffer._id}` : "/api/offers";
      const method = existingOffer ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        // 409 = duplicate offer on this request; still a friendly message, no
        // special-casing needed beyond surfacing body.message like any other error.
        throw new Error(body.message || "Failed to save offer");
      }
      toast.success(existingOffer ? "Offer updated" : "Offer submitted");
      if (onSuccess) onSuccess(body);
    } catch (error) {
      toast.error(error.message || "Failed to save offer");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Media</h2>
        <MediaUploader
          value={form.media}
          onChange={(media) => update("media", media)}
          folder="richlux/offers"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isSaving}>
          {existingOffer ? "Save Changes" : "Submit Offer"}
        </Button>
      </div>
    </form>
  );
}

export default OfferForm;
