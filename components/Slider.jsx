"use client";
import Image from "next/image";
function Slider({ img }) {
  return (
    <div>
      <Image
        src={img}
        alt="bannerimg"
        width={1500}
        height={750}
        className="w-full h-[90vh] object-cover"
      />
    </div>
  );
}

export default Slider;
