"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
 import 'swiper/css';
 import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "swiper/css/effect-fade";
import Slider from "./Slider";
import { EffectFade, Navigation, Pagination, EffectCoverflow, Autoplay} from "swiper/modules";
const banner = [
  { name: "BeechBay", image: "/images/hero1.jpg" },
  { name: "Classic", image: "/images/hero2.jpg" },
  { name: "Sunset Home", image: "/images/hero3.jpg" },
  { name: "Lagoon", image: "/images/hero5.jpg" },
];

function Hero() {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      effect="fade"
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      loop={true}
      navigation={true}
      pagination={{
        clickable: true,
      }}
      modules={[Navigation, Pagination, EffectFade, EffectCoverflow, Autoplay]}
      className="mySwiper"
    >
      {banner.map((banr, i) => (
        <SwiperSlide key={i} className="swiperslide">
          <Slider img={banr.image} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Hero;
