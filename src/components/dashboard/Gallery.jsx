"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { X, ArrowUpRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Gallery() {
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const galleryImages = [
    "/images/building2.png",
    "/images/building2.png",
    "/images/building2.png",
    "/images/building2.png",
  ];

  return (
    <>
      <section className="mt-24 mb-16 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[1200px]"
        >
          <div className="mb-12 flex flex-col items-center text-center space-y-4">
            <h2 className="text-primary font-serif text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              View Gallery
            </h2>
            <Link
              href="/dashboard/gallery"
              className="group mt-6 inline-flex gap-3 rounded-full bg-charcoal px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-charcoal hover:shadow-xl hover:shadow-primary/20"
            >
              Explore Full Gallery
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="relative group w-full">
            {mounted && (
              <Swiper
                slidesPerView={1}
                spaceBetween={30}
                loop={true}
                pagination={{
                  clickable: true,
                  el: ".gallery-pagination",
                }}
                navigation={{
                  nextEl: ".swiper-button-next-custom",
                  prevEl: ".swiper-button-prev-custom",
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                modules={[Pagination, Navigation, Autoplay]}
                className="gallerySwiper rounded-[2.5rem] overflow-hidden premium-border-glow shadow-2xl"
              >
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="group/card relative w-full overflow-hidden aspect-[4/3] md:aspect-21/9 bg-white">
                      <Image
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                        priority={index === 0}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-100" />

                      <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 flex items-end justify-between">
                        <div className="text-white translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-2 shadow-black drop-shadow-md">
                            Prime Builder
                          </p>
                          <h4 className="font-serif text-2xl md:text-4xl font-bold italic shadow-black drop-shadow-lg">
                            Building View {index + 1}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedImage(image)}
                          className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-primary hover:text-charcoal transition-all border border-white/20"
                        >
                          <Maximize2 size={24} />
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}

                {/* Custom Navigation Arrows overlaying the image */}
                <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-charcoal/50 text-white backdrop-blur-sm border border-white/10 hover:bg-primary hover:border-primary cursor-pointer transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </div>
                <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-charcoal/50 text-white backdrop-blur-sm border border-white/10 hover:bg-primary hover:border-primary cursor-pointer transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </Swiper>
            )}
          </div>

          <div className="gallery-pagination mt-8 flex justify-center gap-3" />
        </motion.div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/90 p-4 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-[3rem] premium-border-glow shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute right-8 top-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-charcoal"
              >
                <X className="h-6 w-6" />
              </button>

              <Image
                src={selectedImage}
                alt="Selected gallery image"
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .gallerySwiper {
          padding-bottom: 0px !important;
        }

        .gallery-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #c29e6d;
          opacity: 0.2;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gallery-pagination .swiper-pagination-bullet-active {
          width: 40px;
          border-radius: 4px;
          opacity: 1;
        }
      `}</style>
    </>
  );
}
