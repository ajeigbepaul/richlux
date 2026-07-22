"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";
import { CldImage, getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { FaPlay, FaPause } from "react-icons/fa";
import Spinner from "@/components/ui/Spinner";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function ImageSlide({ banner, preload }) {
  return (
    <div className="relative w-full h-[90vh]">
      <CldImage
        src={banner.publicId}
        alt={banner.title || "Richlux property banner"}
        fill
        sizes="100vw"
        preload={preload}
        loading={preload ? undefined : "lazy"}
        className="object-cover"
      />
    </div>
  );
}

// The swiping image carousel at the top -- unrelated to the single video
// section below it, so it's fine for this to be empty (renders nothing) if
// only a video has been uploaded, and vice versa.
function ImageCarousel({ images }) {
  if (images.length === 0) return null;

  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      effect="fade"
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      // Swiper warns (and behaves oddly) about loop mode with only one
      // slide -- only worth it once there's actually something to loop.
      loop={images.length > 1}
      navigation={true}
      pagination={{
        clickable: true,
      }}
      modules={[Navigation, Pagination, EffectFade, Autoplay]}
      className="mySwiper"
    >
      {images.map((banner, i) => (
        <SwiperSlide key={banner._id} className="swiperslide">
          <ImageSlide banner={banner} preload={i === 0} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// A single plain player, not a slide in the carousel above -- only one video
// ever exists (see POST /api/banners), so there's nothing to swipe between.
// Deferred until the section actually scrolls near the viewport (rather than
// on page load) so the video's bytes never compete with the image carousel
// or the rest of the homepage for bandwidth up front.
function VideoSection({ video }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  // Mirrors the video's actual play state via onPlay/onPause rather than
  // just tracking button clicks, so it stays correct even if autoplay gets
  // blocked or the video is paused some other way.
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  if (!video) return null;

  // Cloudinary derives a poster frame from the same publicId requested
  // through the image (not video) delivery URL -- shows instantly instead of
  // a blank box while the actual video is still deferred/buffering.
  const poster = getCldImageUrl({ src: video.publicId, quality: "auto" });
  const src = inView ? getCldVideoUrl({ src: video.publicId, quality: "auto" }) : undefined;

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[90vh] bg-ink-900">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        autoPlay
        playsInline
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className="absolute bottom-6 left-6 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
      >
        {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-0.5" />}
      </button>
    </div>
  );
}

function Hero() {
  // Public endpoint, active banners only, already sorted by display order.
  const { data, isLoading } = useSWR("/api/banners", fetcher);
  const banners = Array.isArray(data) ? data : [];
  const images = banners.filter((banner) => banner.type === "image");
  const video = banners.find((banner) => banner.type === "video") || null;

  if (isLoading) {
    return (
      <div className="w-full h-[90vh] bg-ink-100 dark:bg-surface-900 flex items-center justify-center">
        <Spinner size={44} className="text-brand-400" />
      </div>
    );
  }

  return (
    <>
      <ImageCarousel images={images} />
      <VideoSection video={video} />
    </>
  );
}

export default Hero;
