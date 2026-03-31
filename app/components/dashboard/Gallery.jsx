"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function Gallery() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const galleryImages = [
        "/images/building2.png",
        "/images/building2.png",
        "/images/building2.png",
        "/images/building2.png",
        "/images/building2.png",
    ];

    return (
        <div className="mt-25">
            <div className="relative background-color-section ">
                <div className="container mx-auto px-6">
                    <h2 className="mb-14 mt-8 text-center lg:text-5xl text-4xl parisienne-font text-black">
                        Gallery
                    </h2>

                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-[#08211e] relative">
                            Latest
                            <div className="absolute -bottom-1 left-0 w-8 h-1 bg-[#c29e6d] rounded-full" />
                        </h3>
                        <Link href="/dashboard/gallery">
                            <button className="group flex items-center gap-2 rounded-full border-2 border-[#08211e] px-6 py-2 text-sm font-bold text-[#08211e] hover:bg-[#08211e] hover:text-white">
                                View all gallery
                                <span className="group-hover:translate-x-1">→</span>
                            </button>
                        </Link>
                    </div>


                    <div className="py-8 overflow-hidden rounded-[26px]">
                        {mounted && (
                            <Swiper
                                modules={[Pagination]}
                                slidesPerView={3}
                                centeredSlides={true}
                                spaceBetween={20}
                                loop={true}
                                pagination={{
                                    clickable: true,
                                    el: ".gallery-pagination",
                                }}
                                breakpoints={{
                                    0: { slidesPerView: 1.2, spaceBetween: 10 },
                                    640: { slidesPerView: 2, spaceBetween: 15 },
                                    1024: { slidesPerView: 2, spaceBetween: 24 },
                                }}
                                className="gallerySwiper"
                            >
                                {galleryImages.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="gallery-card group">
                                            <div className="relative overflow-hidden rounded-[20px]">
                                                <img
                                                    src={image}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-64 md:h-80 lg:h-[420px] object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#08211e]/60 to-transparent opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>


                    <div className="gallery-pagination mt-10 flex justify-center gap-2"></div>
                </div>

                <style jsx global>{`
          .gallerySwiper {
            padding: 40px 0 !important;
            overflow: visible !important;
          }

          .gallerySwiper .swiper-slide {
            opacity: 0.4;
            transform: scale(0.85);
          }

          .gallerySwiper .swiper-slide-active {
            opacity: 1;
            transform: scale(1.1);
            z-index: 10;
          }

          .gallery-card {
            background: white;
            border-radius: 26px;
            padding: 8px;
            border: 1px solid rgba(194, 158, 109, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            overflow: hidden !important;
          }

          .swiper-slide-active .gallery-card {
            border-color: #c29e6d;
            box-shadow: 0 25px 50px -12px rgba(8, 33, 30, 0.25);
          }

          .gallery-pagination .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #08211e;
            opacity: 0.2;
          }

          .gallery-pagination .swiper-pagination-bullet-active {
            opacity: 1;
            background: #c29e6d;
            width: 32px;
            border-radius: 6px;
          }
        `}</style>


            </div>
        </div>
    );
}