"use client";

import React from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import OfferCard from "@/components/OfferCard";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";
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

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-caption text-ink-500 dark:text-slate-400">{label}</dt>
      <dd className="text-ink-900 dark:text-white font-medium">{value}</dd>
    </div>
  );
}

function RequestDetailCard({ data }) {
  const isShortlet = data.category === "shortlet";
  const isRental = data.category === "rental";
  const isPropertyManagement = data.category === "property-management";
  const isLandSale = data.category === "land-sale";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-caption uppercase tracking-wide text-brand-500 dark:text-brand-400 font-semibold">
            {LISTING_CATEGORY_LABELS[data.category] || data.category}
          </span>
          <h1 className="text-h1 text-ink-900 dark:text-white mt-1">
            {formatNaira(data.budgetMin)} – {formatNaira(data.budgetMax)}
            {data.priceFrequency && data.priceFrequency !== "one-time" && (
              <span className="text-caption text-ink-500 dark:text-slate-400 font-normal">
                {" "}
                / {data.priceFrequency.replace("per-", "")}
              </span>
            )}
          </h1>
        </div>
        <Badge status={data.status} />
      </div>

      {data.listingId && (
        <p className="mt-3 text-caption text-ink-500 dark:text-slate-400 bg-ink-100 dark:bg-surface-700 rounded-lg p-3">
          This request was a direct inquiry about a specific listing.
        </p>
      )}

      <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mt-6">
        {isLandSale ? (
          <>
            <DetailRow label="Land size" value={data.landSize} />
            <DetailRow
              label="Title document"
              value={LAND_TITLE_DOCUMENT_LABELS[data.titleDocumentType]}
            />
            <DetailRow label="Purpose" value={LAND_PURPOSE_LABELS[data.landPurpose]} />
          </>
        ) : (
          <>
            <DetailRow label="Apartment type" value={data.type} />
            <DetailRow
              label="Bedrooms"
              value={typeof data.bedrooms === "number" ? data.bedrooms : null}
            />
            <DetailRow
              label="Bathrooms"
              value={typeof data.bathrooms === "number" ? data.bathrooms : null}
            />
            {!isPropertyManagement && (
              <>
                <DetailRow
                  label="Furnishing"
                  value={FURNISHING_LABELS[data.furnishing]}
                />
                <DetailRow
                  label="Parking needed"
                  value={
                    typeof data.parkingRequired === "boolean"
                      ? data.parkingRequired
                        ? "Yes"
                        : "No"
                      : null
                  }
                />
                <DetailRow
                  label="Household size"
                  value={typeof data.householdSize === "number" ? data.householdSize : null}
                />
              </>
            )}
            <DetailRow
              label={isPropertyManagement ? "Management start timeframe" : "Move-in timeframe"}
              value={MOVE_IN_TIMEFRAME_LABELS[data.moveInTimeframe]}
            />
          </>
        )}
        {isRental && (
          <DetailRow
            label="Lease duration preference"
            value={LEASE_DURATION_LABELS[data.leaseDurationPreference]}
          />
        )}
        {isShortlet && (
          <>
            <DetailRow label="Check-in" value={formatDate(data.checkInDate)} />
            <DetailRow label="Check-out" value={formatDate(data.checkOutDate)} />
            <DetailRow
              label="Number of guests"
              value={typeof data.numberOfGuests === "number" ? data.numberOfGuests : null}
            />
          </>
        )}
        {isPropertyManagement && (
          <>
            <DetailRow
              label="Occupancy status"
              value={OCCUPANCY_STATUS_LABELS[data.occupancyStatus]}
            />
            <DetailRow
              label="Management service needed"
              value={MANAGEMENT_SERVICE_TYPE_LABELS[data.managementServiceType]}
            />
          </>
        )}
        <DetailRow label="Present location" value={data.presentlocation} />
        <DetailRow
          label="Preferred locations"
          value={data.preferredLocations?.length ? data.preferredLocations.join(", ") : null}
        />
        <DetailRow
          label="Preferred contact method"
          value={CONTACT_METHOD_LABELS[data.preferredContactMethod]}
        />
        <DetailRow
          label="Preferred contact time"
          value={CONTACT_TIME_LABELS[data.preferredContactTime]}
        />
        <DetailRow label="Full name" value={data.fullname} />
        <DetailRow label="Email" value={data.email} />
        <DetailRow label="Phone number" value={data.phonenumber} />
      </dl>

      {data.amenities?.length > 0 && (
        <div className="mt-6">
          <dt className="text-caption text-ink-500 dark:text-slate-400">Amenities</dt>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.amenities.map((amenity) => (
              <span
                key={amenity}
                className="text-caption px-2.5 py-1 rounded-full bg-ink-100 dark:bg-surface-700 text-ink-700 dark:text-slate-200"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.request && (
        <div className="mt-6">
          <dt className="text-caption text-ink-500 dark:text-slate-400">Notes</dt>
          <p className="text-ink-700 dark:text-slate-200 mt-1 whitespace-pre-line">
            {data.request}
          </p>
        </div>
      )}
    </Card>
  );
}

function OffersSection({ data, mutate }) {
  const offers = Array.isArray(data.offers) ? data.offers : [];
  const [acceptingId, setAcceptingId] = React.useState(null);

  const handleAccept = async (offer) => {
    if (
      !window.confirm(
        "Accept this offer? All other offers will be marked as not selected."
      )
    ) {
      return;
    }
    setAcceptingId(offer._id);
    try {
      const res = await fetch(`/api/userrequest/${data._id}/accept-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer._id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to accept offer");
      toast.success("Offer accepted");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to accept offer");
    } finally {
      setAcceptingId(null);
    }
  };

  if (data.status === "closed" && data.acceptedOffer) {
    const acceptedId = data.acceptedOffer?._id || data.acceptedOffer;
    const acceptedOffer =
      offers.find((offer) => offer.status === "accepted") ||
      offers.find((offer) => String(offer._id) === String(acceptedId));
    const otherOffers = offers.filter(
      (offer) => String(offer._id) !== String(acceptedOffer?._id)
    );

    return (
      <div className="mt-10">
        <h2 className="text-h2 text-ink-900 dark:text-white mb-4">Accepted offer</h2>
        {acceptedOffer && (
          <>
            <OfferCard offer={acceptedOffer} highlighted />
            <p className="text-caption text-ink-500 dark:text-slate-400 mt-3">
              You accepted this offer. Contact the agent directly to proceed —
              next steps happen outside the app.
            </p>
          </>
        )}

        {otherOffers.length > 0 && (
          <div className="mt-10">
            <h3 className="text-h2 text-ink-900 dark:text-white mb-4">Other offers</h3>
            <div className="opacity-70 grid md:grid-cols-2 gap-6">
              {otherOffers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-h2 text-ink-900 dark:text-white mb-4">Offers</h2>
      {offers.length === 0 ? (
        <p className="text-ink-500 dark:text-slate-400">
          No offers yet — agents are reviewing your request. Check back soon.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              actions={
                offer.status === "pending" ? (
                  <Button
                    className="w-full"
                    isLoading={acceptingId === offer._id}
                    onClick={() => handleAccept(offer)}
                  >
                    Accept this offer
                  </Button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyRequestDetailPage() {
  const { id } = useParams();
  const { data, isLoading, mutate } = useSWR(
    id ? `/api/userrequest/${id}` : null,
    fetcher
  );

  const hasError = data && data.message && !data._id;

  return (
    <main className="w-full bg-white dark:bg-surface-900 min-h-screen flex flex-col">
      <Header />
      <Container className="py-10 flex-1">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "My Requests", href: "/my-requests" },
            {
              label: data?.category
                ? LISTING_CATEGORY_LABELS[data.category] || data.category
                : "Request Details",
            },
          ]}
        />

        <div className="mt-4">
          {isLoading ? (
            <Spinner className="text-brand-400 py-10" />
          ) : hasError ? (
            <p className="text-ink-500 dark:text-slate-400">
              {data.message === "Not found"
                ? "This request could not be found."
                : "You don't have permission to view this request."}
            </p>
          ) : (
            <>
              <RequestDetailCard data={data} />
              {!data.listingId && <OffersSection data={data} mutate={mutate} />}
            </>
          )}
        </div>
      </Container>
      <Footer />
    </main>
  );
}
