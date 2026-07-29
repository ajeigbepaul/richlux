import React from "react";
import Image from "next/image";
import { FaBed, FaBath, FaMapMarkerAlt } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import MediaGallery from "@/components/ui/MediaGallery";

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

// Shared between the admin request-detail page and the requester's
// "My Requests" compare screen -- `actions` is a slot the caller fills
// differently per context (Edit/Withdraw/Force-decline on admin side,
// "Accept this offer" on the requester side) so this component never needs
// to know who's looking at it.
function OfferCard({ offer, showAgent = true, highlighted = false, actions }) {
  const location = [
    offer.location?.address,
    offer.location?.area,
    offer.location?.city,
    offer.location?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      className={`overflow-hidden ${
        highlighted ? "ring-2 ring-brand-400" : ""
      } ${offer.status === "declined" || offer.status === "withdrawn" ? "opacity-60" : ""}`}
    >
      <MediaGallery media={offer.media} title={offer.title} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink-900 dark:text-white">{offer.title}</h3>
          <Badge status={offer.status} />
        </div>

        {showAgent && offer.agent && (
          <div className="flex items-center space-x-2">
            <Image
              src={offer.agent.image || "/profilepic.jpg"}
              alt={offer.agent.username || "Agent"}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="text-caption text-ink-500 dark:text-slate-400">
              <p className="text-ink-700 dark:text-slate-200 font-medium">
                {offer.agent.username}
              </p>
              {highlighted && (
                <p>
                  {offer.agent.phone && <span>{offer.agent.phone} · </span>}
                  {offer.agent.email}
                </p>
              )}
            </div>
          </div>
        )}

        <p className="font-bold text-ink-900 dark:text-white">
          {formatNaira(offer.price)}
          {offer.priceFrequency && offer.priceFrequency !== "one-time" && (
            <span className="text-caption text-ink-500 dark:text-slate-400 font-normal">
              {" "}
              / {offer.priceFrequency.replace("per-", "")}
            </span>
          )}
        </p>

        {location && (
          <p className="flex items-center gap-1 text-caption text-ink-500 dark:text-slate-400">
            <FaMapMarkerAlt size={11} className="shrink-0 text-ink-400 dark:text-slate-500" />
            {location}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-caption text-ink-700 dark:text-slate-200">
          {typeof offer.bedrooms === "number" && (
            <span className="flex items-center gap-1">
              <FaBed size={13} className="text-brand-700 dark:text-brand-400" />
              {offer.bedrooms}
            </span>
          )}
          {typeof offer.bathrooms === "number" && (
            <span className="flex items-center gap-1">
              <FaBath size={13} className="text-brand-700 dark:text-brand-400" />
              {offer.bathrooms}
            </span>
          )}
        </div>

        <p className="text-caption text-ink-700 dark:text-slate-300">{offer.description}</p>

        {actions && <div className="pt-2 border-t border-ink-300 dark:border-surface-700">{actions}</div>}
      </div>
    </Card>
  );
}

export default OfferCard;
