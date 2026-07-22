"use client";

import React, { useState } from "react";
import { CldImage } from "next-cloudinary";
import { FaExpand, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useBodyScrollLock } from "@/utils/useBodyScrollLock";
import VideoPlayer from "./VideoPlayer";

function MediaGallery({ media = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const active = media[activeIndex];

  useBodyScrollLock(previewOpen);

  // Stop propagation so arrow clicks inside the preview don't bubble up to
  // the overlay's own onClick (which closes the preview on backdrop click).
  const goToPrev = (e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + media.length) % media.length);
  };
  const goToNext = (e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % media.length);
  };

  if (media.length === 0) {
    return (
      <div className="w-full aspect-[16/10] bg-ink-200 dark:bg-surface-800 rounded-2xl flex items-center justify-center text-ink-500 dark:text-slate-400">
        No media yet
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full aspect-[16/10] bg-ink-900 rounded-2xl overflow-hidden">
        {active.type === "video" ? (
          <VideoPlayer publicId={active.publicId} title={title} />
        ) : (
          <CldImage
            src={active.publicId}
            alt={title || "Listing photo"}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
            priority={activeIndex === 0}
          />
        )}
        {/* A standalone control rather than making the whole box clickable --
            VideoPlayer already owns click-to-play and, once playing, the
            embedded player's own scrubber/controls -- an overlapping click
            handler on the container would steal clicks meant for those. */}
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label="View larger preview"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
        >
          <FaExpand size={14} />
        </button>
      </div>

      {media.length > 1 && (
        <div className="mt-3 flex space-x-2 overflow-x-auto pb-1">
          {media.map((item, index) => (
            <button
              key={item.publicId}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                index === activeIndex ? "border-brand-400" : "border-transparent"
              }`}
            >
              <CldImage
                src={item.publicId}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-caption">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {previewOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="absolute inset-0 bg-black/85" />

          {media.length > 1 && (
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous asset"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <FaChevronLeft size={16} />
            </button>
          )}

          <div
            className="relative w-full max-w-7xl h-[70vh] bg-ink-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close preview"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <FaTimes size={16} />
            </button>
            {active.type === "video" ? (
              <VideoPlayer publicId={active.publicId} title={title} />
            ) : (
              <CldImage
                src={active.publicId}
                alt={title || "Listing photo"}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>

          {media.length > 1 && (
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next asset"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <FaChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MediaGallery;
