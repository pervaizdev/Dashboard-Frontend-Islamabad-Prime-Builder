"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { X, ArrowUpRight, Maximize2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPropertyImages } from "@/api/propertyImage";

export default function Gallery() {
  const [mounted, setMounted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchGallery = async () => {
      try {
        const response = await getPropertyImages("Islamabad_Prime_Builder/Dashboard", 5);
        if (response.success && response.data?.dashboard) {
          setImages(response.data.dashboard);
        }
      } catch (error) {
        console.error("Gallery fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).toUpperCase();
  };

  const isVideo = (url) => url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes('/video/upload/');
  const selectedImage =
    selectedImageIndex !== null ? images[selectedImageIndex] : null;

  const showPrevImage = () => {
    if (!images.length || selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
    );
  };

  const showNextImage = () => {
    if (!images.length || selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
    );
  };

  return (
    <>
      <section className="mt-20 lg:mt-26 mb-16 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[1200px]"
        >
          <div className="mb-12">
            <h2 className="text-primary font-serif text-3xl font-bold text-center md:text-5xl lg:text-6xl">
              <span className="text-[#123D32]">View </span> Gallery
            </h2>
            <p className="text-md mt-4 max-w-2xl mx-auto text-charcoal/50 text-center">Take a closer look at our recent work and project highlights.
              See how ideas turn into reality with quality and precision.
              Our gallery captures every step of the journey.</p>
            <div className="mt-13 lg:flex justify-between">
              <h2 className="text-primary font-serif text-3xl font-bold mt-3 lg:text-5xl">
                Latest <hr className="-bottom-2 h-[4px] w-2/3 rounded-full bg-[#123D32]" />
              </h2>
              <Link
                href="/dashboard/gallery"
                className="group mt-6 mb-3 inline-flex w-full lg:w-auto justify-center lg:justify-end gap-3 rounded-full bg-[#123D32] px-8 py-4 text-xs font-bold uppercase text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0"
              >
                Explore Full Gallery
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>
          <div className="relative w-full">
            {loading ? (
              <div className="flex h-[400px] items-center justify-center rounded-[2.5rem] bg-charcoal/5">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : images.length > 0 ? (
              <Swiper
                slidesPerView={1}
                spaceBetween={30}
                loop={images.length > 1}
                pagination={{
                  clickable: true,
                  el: ".gallery-pagination",
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                modules={[Pagination, Autoplay]}
                className="gallerySwiper overflow-hidden rounded-[2.5rem] premium-border-glow shadow-2xl"
              >
                {images.map((item, index) => (
                  <SwiperSlide key={item._id}>
                    <div
                      onClick={() => setSelectedImageIndex(index)}
                      className="relative flex w-full h-[500px] items-center justify-center overflow-hidden rounded-[2.5rem] cursor-pointer"
                    >
                      {isVideo(item.url) ? (
                        <video
                          src={item.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.title || `Gallery ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 1200px"
                          unoptimized={true}
                          className="object-cover"
                          priority={index === 0}
                        />
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-100" />

                      <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 flex items-end justify-between">
                        <div className="text-white max-w-[90%]">
                          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary shadow-black drop-shadow-md">
                            {formatDate(item.createdAt)}
                          </p>
                          {item.title && (
                            <h3 className="mb-3 font-serif text-2xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                              {item.title}
                            </h3>
                          )}
                          {item.title && <hr className="w-12 border-[1.5px] border-primary mb-4 rounded-full" />}
                          {item.description && (
                            <p className="text-sm md:text-base text-white/90 drop-shadow-md line-clamp-2 md:line-clamp-3">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-charcoal/10 bg-charcoal/5 text-charcoal/40">
                <Maximize2 size={48} className="mb-4 opacity-10" />
                <p>No gallery images found</p>
              </div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative flex w-full justify-center items-center">
              {/* Main Content Box */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-black border border-white/10 shadow-2xl flex flex-col max-h-[90vh] w-full max-w-[480px] sm:max-w-[520px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition hover:bg-[#E5C476] hover:text-black shadow-md"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Media Container */}
                <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black min-h-0">
                  {isVideo(selectedImage.url) ? (
                    <video
                      src={selectedImage.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full max-h-[58vh] object-contain block mx-auto z-10"
                    />
                  ) : (
                    <div className="relative w-full h-full min-h-[260px] max-h-[60vh] flex items-center justify-center">
                      <Image
                        src={selectedImage.url}
                        alt={selectedImage.title || "Selected gallery image"}
                        width={1200}
                        height={1200}
                        unoptimized={true}
                        priority
                        className="max-h-[60vh] w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Prev Button Overlay */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showPrevImage();
                      }}
                      className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition hover:bg-[#E5C476] hover:text-black shadow-md"
                      aria-label="Previous image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                  )}

                  {/* Next Button Overlay */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showNextImage();
                      }}
                      className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition hover:bg-[#E5C476] hover:text-black shadow-md"
                      aria-label="Next image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Caption / Footer inside modal */}
                {(selectedImage.title || selectedImage.description || selectedImage.createdAt) && (
                  <div className="w-full bg-[#080808] border-t border-white/10 p-5 sm:p-6 text-white shrink-0">
                    {selectedImage.createdAt && (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#E5C476] mb-1.5">
                        {formatDate(selectedImage.createdAt)}
                      </p>
                    )}
                    {selectedImage.title && (
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight mb-2">
                        {selectedImage.title}
                      </h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-3">
                        {selectedImage.description}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
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
