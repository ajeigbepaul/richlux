"use client";

import React, { useState } from "react";
import { CldImage } from "next-cloudinary";
import VideoPlayer from "./VideoPlayer";

function MediaGallery({ media = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[activeIndex];

  if (media.length === 0) {
    return (
      <div className="w-full aspect-[16/10] bg-ink-200 rounded-2xl flex items-center justify-center text-ink-500">
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
    </div>
  );
}

export default MediaGallery;
