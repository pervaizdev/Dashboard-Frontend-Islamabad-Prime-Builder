"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCoverflow, Autoplay } from "swiper/modules";
import { X, ArrowUpRight, Camera, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

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
    "/images/building2.png",
  ];

  return (
    <>
      <section className="mt-24 mb-16 px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[1400px]"
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

          <div className="relative group">
            {mounted && (
              <Swiper
                modules={[Pagination, EffectCoverflow, Autoplay]}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={"auto"}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                  slideShadows: false,
                }}
                pagination={{
                  clickable: true,
                  el: ".gallery-pagination",
                }}
                className="gallerySwiper"
              >
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={index} className="!w-[300px] sm:!w-[450px] lg:!w-[600px]">
                    <div className="group/card relative overflow-hidden rounded-[2.5rem] bg-white premium-border-glow aspect-[4/3]">
                        <Image
                          src={image}
                          alt="Gallery"
                          fill
                          className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0 transition-all duration-500">
                             <div className="text-white">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Prime Builder</p>
                                <h4 className="font-serif text-lg font-bold italic">Building View {index + 1}</h4>
                             </div>
                             <button 
                                onClick={() => setSelectedImage(image)}
                                className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-primary hover:text-charcoal transition-all"
                             >
                                <Maximize2 size={20} />
                             </button>
                        </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          <div className="gallery-pagination mt-12 flex justify-center gap-3" />
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
          padding: 40px 0 60px !important;
          overflow: visible !important;
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
