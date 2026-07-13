"use client";
import Image from "next/image";
function Slider({ img, alt, priority = false }) {
  return (
    <div className="relative w-full h-[90vh]">
      <Image
        src={img}
        alt={alt || "Richlux property banner"}
        fill
        sizes="100vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="object-cover"
      />
    </div>
  );
}

export default Slider;
