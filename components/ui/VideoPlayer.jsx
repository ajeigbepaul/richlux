"use client";

import React, { useState } from "react";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import { FaPlay } from "react-icons/fa";
import "next-cloudinary/dist/cld-video-player.css";

// Never auto-loads/auto-plays the full video -- only a lightweight poster
// image ships on page load; the real player (and its bytes) mount on click.
function VideoPlayer({ publicId, title }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="relative w-full h-full block group"
        aria-label={`Play video: ${title || "listing walkthrough"}`}
      >
        <CldImage
          src={publicId}
          alt={title || "Video preview"}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <FaPlay size={22} className="text-brand-700 ml-1" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <CldVideoPlayer
      id={`video-${publicId.replace(/\W/g, "-")}`}
      src={publicId}
      width="1920"
      height="1080"
      autoplay
      className="w-full h-full"
    />
  );
}

export default VideoPlayer;
