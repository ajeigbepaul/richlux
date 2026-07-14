"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import OfferCard from "@/components/OfferCard";
import OfferForm from "@/components/admin/OfferForm";
import {
  LISTING_CATEGORY_LABELS,
} from "@/constants/listing";
import {
  MOVE_IN_TIMEFRAME_LABELS,
  FURNISHING_LABELS,
  CONTACT_METHOD_LABELS,
  CONTACT_TIME_LABELS,
} from "@/constants/request";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function formatNaira(amount) {
  return `₦ ${Number(amount || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

// Uses the real GET /api/userrequest/[id] detail endpoint (not the old leads
// page's "find in the full list" hack). This endpoint already scopes `offers`
// server-side per the viewer's role (agent sees only their own offer; manager/
// superadmin see all) via offerVisibilityFilter, plus a sealedOffersCount --
// so this page never has to hide anything client-side, it just renders
// whatever comes back.
export default function RequestDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/userrequest/${id}` : null,
    fetcher
  );

  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);

  const role = session?.user?.role;
  const viewerId = session?.user?.id;
  const isOversight = role === "manager" || role === "superadmin";

  if (isLoading) {
    return <p className="text-ink-500 dark:text-surface-400">Loading request...</p>;
  }

  if (!data || data.message === "Not found" || error) {
    return (
      <div className="space-y-4">
        <p className="text-danger">Request not found.</p>
        <Link href="/admin/requests" className="text-brand-400 hover:underline text-sm">
          Back to Requests
        </Link>
      </div>
    );
  }

  const offers = Array.isArray(data.offers) ? data.offers : [];
  const ownOffer = offers.find((offer) => String(offer.agent?._id) === String(viewerId));
  const canSubmitOffer =
    !data.listingId &&
    data.status === "open" &&
    (role === "agent" || role === "manager") &&
    !ownOffer;

  const handleWithdraw = async (offerId) => {
    if (!confirm("Withdraw this offer? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "withdrawn" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to withdraw offer");
      toast.success("Offer withdrawn");
      mutate();
    } catch (err) {
      toast.error(err.message || "Failed to withdraw offer");
    }
  };

  const handleForceDecline = async (offerId) => {
    if (!confirm("Decline this offer on behalf of the agent?")) return;
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to decline offer");
      toast.success("Offer declined");
      mutate();
    } catch (err) {
      toast.error(err.message || "Failed to decline offer");
    }
  };

  const fields = [
    ["Category", LISTING_CATEGORY_LABELS[data.category] || data.category],
    ["Apartment type", data.type],
    ["Bedrooms", data.bedrooms],
    ["Bathrooms", data.bathrooms],
    ["Furnishing", FURNISHING_LABELS[data.furnishing] || data.furnishing],
    ["Parking spaces", data.parkingSpaces],
    ["Household size", data.householdSize],
    [
      "Budget",
      `${formatNaira(data.budgetMin)} – ${formatNaira(data.budgetMax)}${
        data.priceFrequency && data.priceFrequency !== "one-time"
          ? ` / ${data.priceFrequency.replace("per-", "")}`
          : ""
      }`,
    ],
    ["Move-in timeframe", MOVE_IN_TIMEFRAME_LABELS[data.moveInTimeframe] || data.moveInTimeframe],
    ["Present location", data.presentlocation],
    ["Preferred locations", (data.preferredLocations || []).join(", ")],
    ["Preferred contact method", CONTACT_METHOD_LABELS[data.preferredContactMethod] || data.preferredContactMethod],
    ["Preferred contact time", CONTACT_TIME_LABELS[data.preferredContactTime] || data.preferredContactTime],
    ["Sex", data.sex],
  ];

  if (data.category === "shortlet") {
    fields.push(
      ["Check-in date", formatDate(data.checkInDate)],
      ["Check-out date", formatDate(data.checkOutDate)],
      ["Number of guests", data.numberOfGuests]
    );
  }
  if (data.category === "rental") {
    fields.push(["Lease duration preference", data.leaseDurationPreference]);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white">Request Details</h1>
        <Badge status={data.status} />
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 richshadow space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold text-ink-900 dark:text-white">{data.fullname}</p>
            <p className="text-sm text-ink-500 dark:text-surface-400">
              {data.email} {data.phonenumber && `· ${data.phonenumber}`}
            </p>
          </div>
          {data.userId && (
            <p className="text-xs text-ink-500 dark:text-surface-400">
              Account: {data.userId.username || data.userId.email}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-ink-500 dark:text-surface-400">{label}</dt>
              <dd className="text-ink-900 dark:text-white mt-0.5">
                {value === 0 ? 0 : value || "-"}
              </dd>
            </div>
          ))}
        </dl>

        {data.amenities?.length > 0 && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-500 dark:text-surface-400 mb-1">Amenities</dt>
            <div className="flex flex-wrap gap-2">
              {data.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium bg-ink-200 text-ink-700 dark:bg-surface-700 dark:text-slate-200"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-ink-300 dark:border-surface-700">
          <dt className="text-xs uppercase tracking-wide text-ink-500 dark:text-surface-400">Request notes</dt>
          <dd className="text-ink-900 dark:text-white mt-0.5 whitespace-pre-wrap">{data.request || "-"}</dd>
        </div>
      </div>

      {data.listingId ? (
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 richshadow space-y-2">
          <h2 className="text-h2 text-ink-900 dark:text-white">Direct Inquiry</h2>
          <p className="text-sm text-ink-500 dark:text-surface-400">
            This request is a direct inquiry for a specific listing, not eligible for the
            multi-offer marketplace.
          </p>
          <Link
            href={`/listings/${data.listingId}`}
            className="text-brand-400 hover:underline text-sm font-medium inline-block"
          >
            View listing ({String(data.listingId)})
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-h2 text-ink-900 dark:text-white">Offers</h2>
            {canSubmitOffer && !showNewOfferForm && (
              <Button onClick={() => setShowNewOfferForm(true)}>Submit an Offer</Button>
            )}
          </div>

          {showNewOfferForm && (
            <OfferForm
              requestId={id}
              onSuccess={() => {
                setShowNewOfferForm(false);
                mutate();
              }}
            />
          )}

          {offers.length === 0 ? (
            <p className="text-ink-500 dark:text-surface-400">No offers on this request yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => {
                const isOwnOffer = String(offer.agent?._id) === String(viewerId);
                const isEditing = editingOfferId === offer._id;

                if (isEditing) {
                  return (
                    <div key={offer._id} className="md:col-span-2">
                      <OfferForm
                        requestId={id}
                        existingOffer={offer}
                        onSuccess={() => {
                          setEditingOfferId(null);
                          mutate();
                        }}
                      />
                      <div className="mt-3">
                        <Button variant="secondary" onClick={() => setEditingOfferId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                }

                let actions = null;
                if (isOwnOffer && offer.status === "pending") {
                  actions = (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingOfferId(offer._id)}
                        className="text-brand-400 hover:underline text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWithdraw(offer._id)}
                        className="text-danger hover:underline text-sm font-medium"
                      >
                        Withdraw
                      </button>
                    </div>
                  );
                } else if (isOversight && !isOwnOffer && offer.status === "pending") {
                  actions = (
                    <button
                      type="button"
                      onClick={() => handleForceDecline(offer._id)}
                      className="text-danger hover:underline text-sm font-medium"
                    >
                      Force decline
                    </button>
                  );
                }

                return (
                  <OfferCard
                    key={offer._id}
                    offer={offer}
                    highlighted={isOwnOffer}
                    actions={actions}
                  />
                );
              })}
            </div>
          )}

          {data.sealedOffersCount > 0 && (
            <p className="text-sm text-ink-500 dark:text-surface-400">
              {data.sealedOffersCount} other offer(s) on this request are sealed until the
              requester accepts one.
            </p>
          )}
        </div>
      )}

      <Link href="/admin/requests" className="text-brand-400 hover:underline text-sm inline-block">
        Back to Requests
      </Link>
    </div>
  );
}
