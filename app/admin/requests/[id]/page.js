"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import OfferCard from "@/components/OfferCard";
import OfferFormModal from "@/components/admin/OfferFormModal";
import {
  LISTING_CATEGORY_LABELS,
} from "@/constants/listing";
import {
  MOVE_IN_TIMEFRAME_LABELS,
  FURNISHING_LABELS,
  CONTACT_METHOD_LABELS,
  CONTACT_TIME_LABELS,
  OCCUPANCY_STATUS_LABELS,
  MANAGEMENT_SERVICE_TYPE_LABELS,
  LAND_TITLE_DOCUMENT_LABELS,
  LAND_PURPOSE_LABELS,
  LEASE_DURATION_LABELS,
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
  // Both withdraw and force-decline are the same PATCH with a different
  // target status -- one confirm dialog covers both instead of duplicating it.
  const [confirmAction, setConfirmAction] = useState(null); // { offerId, status, verb, successMessage } | null
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const role = session?.user?.role;
  const viewerId = session?.user?.id;
  const isOversight = role === "manager" || role === "superadmin";

  if (isLoading) {
    return <Spinner className="text-brand-400 py-10" />;
  }

  // The fetcher resolves the JSON body regardless of status code (doesn't
  // check res.ok), so a 403 ("Forbidden" -- e.g. an agent hitting a
  // non-rental request's id directly) needs the same catch as a 404
  // ("Not found") -- otherwise this falls through and tries to render a
  // body that's just { message: "Forbidden" }, with every real field blank.
  if (!data || data.message === "Not found" || data.message === "Forbidden" || error) {
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
  const editingOffer = offers.find((offer) => offer._id === editingOfferId) || null;
  const offerModalOpen = showNewOfferForm || !!editingOffer;

  const closeOfferModal = () => {
    setShowNewOfferForm(false);
    setEditingOfferId(null);
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/offers/${confirmAction.offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirmAction.status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `Failed to ${confirmAction.verb} offer`);
      toast.success(confirmAction.successMessage);
      setConfirmAction(null);
      mutate();
    } catch (err) {
      toast.error(err.message || `Failed to ${confirmAction.verb} offer`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleWithdraw = (offerId) => {
    setConfirmAction({
      offerId,
      status: "withdrawn",
      verb: "withdraw",
      successMessage: "Offer withdrawn",
    });
  };

  const handleForceDecline = (offerId) => {
    setConfirmAction({
      offerId,
      status: "declined",
      verb: "decline",
      successMessage: "Offer declined",
    });
  };

  // Land Sale and Property Management requests carry a fundamentally
  // different field set from the residential search categories (rental,
  // house sale, shortlet) -- build the field list per category rather than
  // always showing a fixed residential base with "-" placeholders for
  // fields that don't apply.
  const isLandSale = data.category === "land-sale";
  const isPropertyManagement = data.category === "property-management";

  const fields = [["Category", LISTING_CATEGORY_LABELS[data.category] || data.category]];

  if (isLandSale) {
    fields.push(
      ["Land size", data.landSize],
      ["Title document", LAND_TITLE_DOCUMENT_LABELS[data.titleDocumentType] || data.titleDocumentType],
      ["Purpose", LAND_PURPOSE_LABELS[data.landPurpose] || data.landPurpose]
    );
  } else {
    fields.push(
      ["Apartment type", data.type],
      ["Bedrooms", data.bedrooms],
      ["Bathrooms", data.bathrooms]
    );
    if (!isPropertyManagement) {
      fields.push(
        ["Furnishing", FURNISHING_LABELS[data.furnishing] || data.furnishing],
        [
          "Parking needed",
          typeof data.parkingRequired === "boolean" ? (data.parkingRequired ? "Yes" : "No") : undefined,
        ],
        ["Household size", data.householdSize]
      );
    }
  }

  fields.push([
    "Budget",
    `${formatNaira(data.budgetMin)} – ${formatNaira(data.budgetMax)}${
      data.priceFrequency && data.priceFrequency !== "one-time"
        ? ` / ${data.priceFrequency.replace("per-", "")}`
        : ""
    }`,
  ]);

  if (!isLandSale) {
    fields.push([
      isPropertyManagement ? "Management start timeframe" : "Move-in timeframe",
      MOVE_IN_TIMEFRAME_LABELS[data.moveInTimeframe] || data.moveInTimeframe,
    ]);
  }

  fields.push(
    ["Present location", data.presentlocation],
    ["Preferred locations", (data.preferredLocations || []).join(", ")],
    ["Preferred contact method", CONTACT_METHOD_LABELS[data.preferredContactMethod] || data.preferredContactMethod],
    ["Preferred contact time", CONTACT_TIME_LABELS[data.preferredContactTime] || data.preferredContactTime],
    ["Sex", data.sex]
  );

  if (data.category === "shortlet") {
    fields.push(
      ["Check-in date", formatDate(data.checkInDate)],
      ["Check-out date", formatDate(data.checkOutDate)],
      ["Number of guests", data.numberOfGuests]
    );
  }
  if (data.category === "rental") {
    fields.push([
      "Lease duration preference",
      LEASE_DURATION_LABELS[data.leaseDurationPreference] || data.leaseDurationPreference,
    ]);
  }
  if (isPropertyManagement) {
    fields.push(
      ["Occupancy status", OCCUPANCY_STATUS_LABELS[data.occupancyStatus] || data.occupancyStatus],
      [
        "Management service needed",
        MANAGEMENT_SERVICE_TYPE_LABELS[data.managementServiceType] || data.managementServiceType,
      ]
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          data.listingId
            ? { label: "Enquiries", href: "/admin/enquiries" }
            : { label: "Requests", href: "/admin/requests" },
          { label: LISTING_CATEGORY_LABELS[data.category] || data.category },
        ]}
      />
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
            {canSubmitOffer && (
              <Button onClick={() => setShowNewOfferForm(true)}>Submit an Offer</Button>
            )}
          </div>

          {offers.length === 0 ? (
            <p className="text-ink-500 dark:text-surface-400">No offers on this request yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => {
                const isOwnOffer = String(offer.agent?._id) === String(viewerId);

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

      <Link
        href={data.listingId ? "/admin/enquiries" : "/admin/requests"}
        className="text-brand-400 hover:underline text-sm inline-block"
      >
        {data.listingId ? "Back to Enquiries" : "Back to Requests"}
      </Link>

      <AnimatePresence>
        {offerModalOpen && (
          <OfferFormModal
            request={data}
            existingOffer={editingOffer}
            onClose={closeOfferModal}
            onSuccess={() => {
              closeOfferModal();
              mutate();
            }}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.status === "withdrawn" ? "Withdraw this offer?" : "Decline this offer?"}
        description={
          confirmAction?.status === "withdrawn"
            ? "This cannot be undone."
            : "This declines it on behalf of the agent."
        }
        confirmLabel={confirmAction?.status === "withdrawn" ? "Withdraw" : "Decline"}
        isLoading={isSubmittingAction}
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
