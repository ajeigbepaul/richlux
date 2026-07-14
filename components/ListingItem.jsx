import Image from "next/image";
import Link from "next/link";
import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function trunc(sentence, limit) {
  const words = sentence?.split(" ") || [];
  if (words.length <= limit) return sentence;
  return words.slice(0, limit).join(" ") + "...";
}

function ListingItem({ listing }) {
  const { _id, title, description, price, category, status, media, location } =
    listing;
  const cover = media?.find((item) => item.isCover) || media?.[0];

  return (
    <Link href={`/listings/${_id}`} className="block w-full">
      <Card hoverLift className="overflow-hidden h-full flex flex-col">
        <div className="relative w-full aspect-[4/3] bg-ink-200 dark:bg-surface-800">
          {cover ? (
            <Image
              src={cover.secureUrl}
              alt={title}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-500 dark:text-slate-400 text-sm">
              No image yet
            </div>
          )}
          <Badge status={status} className="absolute top-3 left-3 bg-white/90 dark:bg-surface-800/90" />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <span className="text-caption uppercase tracking-wide text-brand-500 dark:text-brand-400 font-semibold">
            {LISTING_CATEGORY_LABELS[category] || category}
          </span>
          <h2 className="text-ink-900 dark:text-white font-semibold mt-1">{title}</h2>
          {location?.city && (
            <p className="text-caption text-ink-500 dark:text-slate-400 mt-0.5">
              {[location.address, location.city].filter(Boolean).join(", ")}
            </p>
          )}
          <p className="text-caption text-ink-500 dark:text-slate-400 mt-2 flex-1">
            {trunc(description, 15)}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-ink-900 dark:text-white">{formatNaira(price)}</span>
            <span className="text-caption font-medium text-brand-500 dark:text-brand-400">
              View details →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default ListingItem;
