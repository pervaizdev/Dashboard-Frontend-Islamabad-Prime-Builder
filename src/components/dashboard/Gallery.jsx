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
        const response = await getPropertyImages("Islamabad_Prime_Builder/Dashboard");
        if (response.success) {
          // Show latest 6 images
          setImages(response.data.slice(0, 6));
        }
      } catch (error) {
        console.error("Gallery fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

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
      <section className="mt-24 mb-16 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[1200px]"
        >
          <div className="mb-12">
            <h2 className="text-primary font-serif text-3xl font-bold text-center md:text-5xl lg:text-6xl">
              <span className="text-black">View </span> Gallery
            </h2>
            <p className="text-md mt-4 max-w-2xl mx-auto text-charcoal/50 text-center">Take a closer look at our recent work and project highlights.
              See how ideas turn into reality with quality and precision.
              Our gallery captures every step of the journey.</p>
            <div className="mt-13 flex justify-between">
              <h2 className="text-primary font-serif text-3xl font-bold mt-3 lg:text-5xl">
                Latest <hr className="-bottom-2 h-[3px] w-2/3 rounded-full bg-primary" />
              </h2>
              <Link
                href="/dashboard/gallery"
                className="group mt-6 mb-3 inline-flex gap-3 rounded-full bg-charcoal px-8 py-4 text-xs font-bold uppercase text-white transition-all hover:bg-primary hover:text-charcoal hover:shadow-xl hover:shadow-primary/20"
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
                    <div className="relative flex w-full h-[500px] items-center justify-center overflow-hidden rounded-[2.5rem]">
                      <Image
                        src={item.url}
                        alt={item.title || `Gallery ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="object-cover"
                        priority={index === 0}
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-charcoal/90 via-charcoal/20 to-transparent opacity-100" />

                      <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 flex items-end justify-between">
                        <div className="text-white">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary shadow-black drop-shadow-md md:text-xs">
                            Prime Builder
                          </p>
                          <h4 className="font-serif text-2xl font-bold italic shadow-black drop-shadow-lg md:text-4xl">
                            {item.title || `Building View ${index + 1}`}
                          </h4>
                        </div>

                        <button
                          onClick={() => setSelectedImageIndex(index)}
                          className="rounded-full border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md transition-all hover:bg-primary hover:text-charcoal"
                        >
                          <Maximize2 size={24} />
                        </button>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/90 p-4 backdrop-blur-xl"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative flex items-center justify-center">
              {/* Prev Button - outside modal box */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrevImage();
                  }}
                  className="absolute -left-14 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-charcoal md:flex"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative overflow-hidden rounded-[2rem] premium-border-glow shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-charcoal"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="relative max-h-[85vh] max-w-[90vw]">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.title || "Selected gallery image"}
                    width={1600}
                    height={1200}
                    sizes="90vw"
                    className="h-100vh w-100vw object-contain"
                  />
                </div>
              </motion.div>

              {/* Next Button - outside modal box */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNextImage();
                  }}
                  className="absolute -right-14 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-charcoal md:flex"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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

              {/* Mobile buttons */}
              {images.length > 1 && (
                <div className="absolute -bottom-16 left-1/2 flex -translate-x-1/2 gap-4 md:hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrevImage();
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-charcoal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showNextImage();
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-charcoal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
                </div>
              )}
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
