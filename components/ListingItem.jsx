"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";
import React from "react";
import { FaBed, FaBath, FaMapMarkerAlt, FaRulerCombined, FaChevronRight } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Badge, { FeaturedBadge } from "@/components/ui/Badge";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function ListingItem({ listing, priority = false }) {
  const {
    _id,
    title,
    description,
    price,
    category,
    status,
    media,
    location,
    isFeatured,
    bedrooms,
    bathrooms,
    landSize,
  } = listing;
  const cover = media?.find((item) => item.isCover) || media?.[0];

  return (
    <Link href={`/listings/${_id}`} className="block w-full h-full">
      <Card hoverLift className="overflow-hidden h-full flex flex-col">
        <div className="relative w-full aspect-[4/3] bg-ink-200 dark:bg-surface-800 overflow-hidden group">
          {cover ? (
            // CldImage (not next/image + raw secureUrl) so the exact
            // requested size + auto format/quality (WebP/AVIF, compressed)
            // is what actually gets fetched, instead of Next re-optimizing
            // an unoptimized Cloudinary original -- the biggest single win
            // for a card grid rendering many of these at once. `priority` on
            // just the first card (its actual grid position varies by
            // caller/breakpoint, but it's always the LCP candidate) so it
            // isn't lazy-loaded like the rest of the grid.
            <CldImage
              src={cover.publicId}
              alt={title}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              priority={priority}
              className="object-cover transition-transform duration-300 ease-luxury group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-500 dark:text-slate-400 text-sm">
              No image yet
            </div>
          )}
          {/* Legibility floor for the status badge against varied photo
              content, not a caption background -- kept subtle and top-only. */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
          <Badge status={status} className="absolute top-3 left-3 bg-white/90 dark:bg-surface-800/90" />
          {isFeatured && <FeaturedBadge className="absolute top-3 right-3" />}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <span className="text-caption uppercase tracking-wide text-brand-700 dark:text-brand-400 font-semibold">
            {LISTING_CATEGORY_LABELS[category] || category}
          </span>
          <h2 className="text-ink-900 dark:text-white font-semibold mt-1">{title}</h2>
          {location?.city && (
            <p className="flex items-center gap-1 text-caption text-ink-500 dark:text-slate-400 mt-1">
              <FaMapMarkerAlt size={11} className="shrink-0 text-ink-400 dark:text-slate-500" />
              <span className="truncate">
                {[location.address, location.city].filter(Boolean).join(", ")}
              </span>
            </p>
          )}
          {(typeof bedrooms === "number" || typeof bathrooms === "number" || landSize) && (
            <div className="flex items-center gap-3 text-caption text-ink-700 dark:text-slate-200 mt-2">
              {typeof bedrooms === "number" && (
                <span className="flex items-center gap-1">
                  <FaBed size={13} className="text-brand-700 dark:text-brand-400" />
                  {bedrooms}
                </span>
              )}
              {typeof bathrooms === "number" && (
                <span className="flex items-center gap-1">
                  <FaBath size={13} className="text-brand-700 dark:text-brand-400" />
                  {bathrooms}
                </span>
              )}
              {landSize && (
                <span className="flex items-center gap-1">
                  <FaRulerCombined size={13} className="text-brand-700 dark:text-brand-400" />
                  {landSize}
                </span>
              )}
            </div>
          )}
          <p className="text-caption text-ink-500 dark:text-slate-400 mt-2 flex-1 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-serif font-semibold text-lg text-ink-900 dark:text-white">
              {formatNaira(price)}
            </span>
            <span className="flex items-center gap-1 text-caption font-medium text-brand-700 dark:text-brand-400">
              View details
              <FaChevronRight size={10} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default ListingItem;
