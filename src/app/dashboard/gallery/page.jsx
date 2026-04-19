"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, X, MoveLeft, MoveRight, ArrowLeft, Camera, Maximize2 } from "lucide-react";
import { Swiper as SwiperComp, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { getPropertyImages } from "@/api/propertyImage";
import { Loader2 } from "lucide-react";

const GalleryPage = () => {
    const [selectedIdx, setSelectedIdx] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState("Recent");
    const [allImages, setAllImages] = React.useState([]);
    const [filteredImages, setFilteredImages] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    const tabs = ["Recent", "1 month ago", "3 months ago"];

    React.useEffect(() => {
        const fetchGallery = async () => {
            setLoading(true);
            try {
                const response = await getPropertyImages("Islamabad_Prime_Builder/Dashboard");
                if (response.success) {
                    setAllImages(response.data);
                    setFilteredImages(response.data);
                }
            } catch (error) {
                console.error("Gallery page fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    React.useEffect(() => {
        if (!allImages.length) return;

        const now = new Date();
        let filtered = [...allImages];

        if (activeTab === "1 month ago") {
            const oneMonthAgo = new Date(now.setDate(now.getDate() - 30));
            filtered = allImages.filter(img => new Date(img.createdAt) >= oneMonthAgo);
        } else if (activeTab === "3 months ago") {
            const threeMonthsAgo = new Date(now.setDate(now.getDate() - 90));
            filtered = allImages.filter(img => new Date(img.createdAt) >= threeMonthsAgo);
        }

        setFilteredImages(filtered);
    }, [activeTab, allImages]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).toUpperCase();
    };

    const selectedImage =
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
        <div className="min-h-screen px-4 py-8 lg:px-16 space-y-12 bg-white">
            <div className="max-w-[1600px] mx-auto">

                {/* Header & Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="space-y-6 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h1 className="font-serif text-4xl font-bold tracking-tight text-charcoal md:text-6xl text-[#0d2d29]">
                                Architectural <span className="text-primary">Gallery</span>
                            </h1>
                            <Link
                                href="/dashboard"
                                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-charcoal px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-charcoal hover:shadow-xl hover:shadow-primary/20"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Return Home
                            </Link>
                        </div>

                        <div className="flex items-center gap-10 pt-4 border-t border-primary/10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "text-primary" : "text-[#0d2d29]/40 hover:text-[#0d2d29]"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTabLine"
                                            className="absolute -bottom-2 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(194,158,109,0.5)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>




                </motion.div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center text-primary">
                        <Loader2 className="animate-spin mb-4" size={64} />
                        <p className="uppercase tracking-widest font-bold">Curating Collection...</p>
                    </div>
                ) : filteredImages.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[300px]"
                    >
                        {filteredImages.map((item, index) => (
                            <motion.div
                                key={item._id}
                                variants={itemVariants}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer premium-border-glow shadow-xl bg-white`}
                            >
                                <Image
                                    src={item.url}
                                    alt={item.title || "Gallery Item"}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                        <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className=" font-bold uppercase text-white opacity-80 mb-1">{formatDate(item.createdAt)}</p>
                                            
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-100">
                                            <Maximize2 size={20} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-[#0d2d29]/20 border-2 border-dashed border-[#c29e6d]/10 rounded-3xl">
                        <Camera size={64} className="mb-4 opacity-10" />
                        <p className="uppercase tracking-widest font-bold">No items found for this period</p>
                    </div>
                )}
            </div>

            {/* Premium Lightbox */}
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
                            {filteredImages.length > 1 && (
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
                            {filteredImages.length > 1 && (
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
                            {filteredImages.length > 1 && (
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
                .gallery-viewer-swiper .swiper-pagination {
                    bottom: 0 !important;
                }
                .gallery-viewer-swiper .swiper-pagination-bullet {
                    width: 6px;
                    height: 6px;
                    background: #c29e6d;
                    opacity: 0.2;
                    transition: all 0.3s ease;
                    margin: 0 6px !important;
                }
                .gallery-viewer-swiper .swiper-pagination-bullet-active {
                    width: 30px;
                    border-radius: 4px;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default GalleryPage;
