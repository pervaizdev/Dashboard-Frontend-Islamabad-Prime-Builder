"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Maximize2,
  Play,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPropertyImages } from "@/api/propertyImage";

const GalleryPage = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [allImages, setAllImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const lightboxVideoRef = useRef(null);
  const tabs = ["All", "Recent", "1 month ago", "3 months ago"];

  // Fetch full gallery data
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const response = await getPropertyImages("Islamabad_Prime_Builder/Dashboard");
        if (response.success && response.data?.dashboard) {
          const sorted = [...response.data.dashboard].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setAllImages(sorted);
          setFilteredImages(sorted);
        }
      } catch (error) {
        console.error("Gallery page fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Filter gallery items by selected date tab and sort latest first
  useEffect(() => {
    if (!allImages.length) return;

    let filtered = [...allImages];

    if (activeTab === "Recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentItems = allImages.filter((img) => new Date(img.createdAt) >= sevenDaysAgo);
      filtered = recentItems.length > 0 ? recentItems : allImages.slice(0, 5);
    } else if (activeTab === "1 month ago") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      filtered = allImages.filter((img) => new Date(img.createdAt) >= oneMonthAgo);
    } else if (activeTab === "3 months ago") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
      filtered = allImages.filter((img) => new Date(img.createdAt) >= threeMonthsAgo);
    } else if (activeTab === "All") {
      filtered = [...allImages];
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredImages(filtered);
  }, [activeTab, allImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft") {
        showPrevImage();
      } else if (e.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, filteredImages]);

  // Pause video when modal selection changes or closes
  useEffect(() => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
      lightboxVideoRef.current.currentTime = 0;
    }
  }, [selectedImageIndex]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  };

  const isVideo = (url) =>
    Boolean(url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes("/video/upload/"));

  // Assign varied aspect ratios for an organic Pinterest/Unsplash Masonry effect
  const getAspectRatioClass = (index) => {
    const ratios = [
      "aspect-[4/3]",
      "aspect-[3/4]",
      "aspect-square",
      "aspect-[16/10]",
      "aspect-[4/5]",
    ];
    return ratios[index % ratios.length];
  };

  const selectedItem =
    selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  const showPrevImage = () => {
    if (!filteredImages.length || selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === 0 ? filteredImages.length - 1 : selectedImageIndex - 1
    );
  };

  const showNextImage = () => {
    if (!filteredImages.length || selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === filteredImages.length - 1 ? 0 : selectedImageIndex + 1
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 md:px-8 lg:px-12 space-y-10 text-neutral-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header & Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
                Architectural <span className="text-primary">Gallery</span>
              </h1>
              <p className="mt-2 text-sm text-neutral-500 max-w-xl">
                Explore our collection of recent developments, construction progress, and architectural visualisations.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-neutral-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary hover:text-neutral-900 hover:shadow-lg"
              aria-label="Return to dashboard"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to dashboard
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shrink-0 ${
                    isActive
                      ? "bg-primary text-neutral-900 shadow-sm"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
                  }`}
                  aria-label={`Filter by ${tab}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Masonry Random Grid Gallery */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-primary space-y-3">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-xs uppercase tracking-widest font-semibold text-neutral-400">
              Loading collection...
            </p>
          </div>
        ) : filteredImages.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          >
            {filteredImages.map((item, index) => {
              const itemIsVideo = isVideo(item.url);
              const aspectClass = getAspectRatioClass(index);

              return (
                <motion.div
                  key={item._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                  className="break-inside-avoid group relative w-full mb-6 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5"
                >
                  <div className={`relative w-full ${aspectClass}`}>
                    {/* Media Content */}
                    {itemIsVideo ? (
                      <video
                        src={item.url}
                        preload="metadata"
                        muted
                        playsInline
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.title || `Gallery item ${index + 1}`}
                        fill
                        unoptimized={true}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Video Badge */}
                    {itemIsVideo && (
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                        <Video className="h-3 w-3 text-primary" />
                        <span>Video</span>
                      </div>
                    )}

                    {/* Centered Play Button Overlay for Videos */}
                    {itemIsVideo && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-neutral-900 group-hover:border-primary">
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay & Metadata */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-3 text-white">
                      <div className="max-w-[85%]">
                        {item.createdAt && (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 drop-shadow-sm">
                            {formatDate(item.createdAt)}
                          </p>
                        )}
                        {item.title && (
                          <h3 className="font-serif text-base md:text-lg font-semibold text-white line-clamp-1 leading-snug drop-shadow-md">
                            {item.title}
                          </h3>
                        )}
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-primary group-hover:text-neutral-900">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-3xl bg-white p-8 text-center text-neutral-400">
            <Camera size={48} className="mb-3 opacity-30 text-neutral-400" />
            <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              No gallery items found for this period
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative flex w-full max-w-6xl items-center justify-center">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedImageIndex(null)}
                className="absolute -top-12 right-0 md:top-4 md:right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-neutral-900"
                aria-label="Close preview"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Prev Button (Desktop) */}
              {filteredImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrevImage();
                  }}
                  className="absolute -left-14 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-neutral-900 lg:flex"
                  aria-label="Previous item"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Main Content Box */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-950 shadow-2xl max-h-[85vh] max-w-[90vw] flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center">
                  {isVideo(selectedItem.url) ? (
                    <video
                      ref={lightboxVideoRef}
                      src={selectedItem.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="max-h-[75vh] max-w-[90vw] object-contain"
                    />
                  ) : (
                    <Image
                      src={selectedItem.url}
                      alt={selectedItem.title || "Selected gallery image"}
                      width={1600}
                      height={1200}
                      unoptimized={true}
                      priority
                      className="max-h-[75vh] max-w-[90vw] object-contain"
                    />
                  )}
                </div>

                {/* Caption / Footer inside modal */}
                {(selectedItem.title || selectedItem.description || selectedItem.createdAt) && (
                  <div className="w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white space-y-1.5">
                    {selectedItem.createdAt && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {formatDate(selectedItem.createdAt)}
                      </p>
                    )}
                    {selectedItem.title && (
                      <h3 className="font-serif text-lg md:text-2xl font-semibold leading-snug">
                        {selectedItem.title}
                      </h3>
                    )}
                    {selectedItem.description && (
                      <p className="text-xs md:text-sm text-neutral-300 max-w-3xl line-clamp-2">
                        {selectedItem.description}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Next Button (Desktop) */}
              {filteredImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNextImage();
                  }}
                  className="absolute -right-14 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-neutral-900 lg:flex"
                  aria-label="Next item"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Mobile Prev / Next controls */}
              {filteredImages.length > 1 && (
                <div className="absolute -bottom-16 left-1/2 flex -translate-x-1/2 gap-4 lg:hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrevImage();
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-neutral-900"
                    aria-label="Previous item"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showNextImage();
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-primary hover:text-neutral-900"
                    aria-label="Next item"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
