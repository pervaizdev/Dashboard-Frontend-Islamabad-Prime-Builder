"use client";

import React from "react";
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

    return (
        <div className="min-h-screen px-4 py-8 lg:px-16 space-y-12 bg-white">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header & Navigation */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                             <div className="h-[1px] w-12 bg-primary/30" />
                             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Private Collection</p>
                        </div>
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-charcoal md:text-6xl text-[#0d2d29]">
                            Architectural <span className="text-primary italic">Gallery</span>
                        </h1>
                        
                        <div className="flex items-center gap-10 pt-4 border-t border-primary/10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        activeTab === tab ? "text-primary" : "text-[#0d2d29]/40 hover:text-[#0d2d29]"
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

                    <div className="flex flex-col items-end gap-4">
                        <p className="font-script text-2xl text-primary opacity-60 pr-4">Prime-Builder Estates</p>
                        <Link
                            href="/dashboard"
                            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-charcoal px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-charcoal hover:shadow-xl hover:shadow-primary/20"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Return Home
                        </Link>
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
                                onClick={() => setSelectedIdx(index)}
                                className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer premium-border-glow shadow-xl bg-white`}
                            >
                                <Image
                                    src={item.url}
                                    alt={item.title || "Gallery Item"}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                        <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{formatDate(item.createdAt)}</p>
                                            <h3 className="font-serif text-lg font-bold italic">{item.title || "Gallery View"}</h3>
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
                {selectedIdx !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-charcoal/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 shimmer-gold z-[10000]" />
                        
                        <button
                            onClick={() => setSelectedIdx(null)}
                            className="absolute top-[60px] right-[70px] text-white/50 hover:text-primary transition-all z-[10000] bg-white/5 p-4 rounded-full backdrop-blur-md"
                        >
                            <X size={28} />
                        </button>

                        <div className="w-full h-full max-w-screen-2xl relative">
                            <SwiperComp
                                initialSlide={selectedIdx}
                                onSlideChange={(swiper) => setSelectedIdx(swiper.activeIndex)}
                                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                                effect="fade"
                                navigation={{
                                    prevEl: '.swiper-btn-prev',
                                    nextEl: '.swiper-btn-next',
                                }}
                                pagination={{ 
                                    clickable: true,
                                    renderBullet: (index, className) => {
                                        return `<span class="${className}"></span>`;
                                    }
                                }}
                                className="h-full w-full gallery-viewer-swiper"
                            >
                                {filteredImages.map((item) => (
                                    <SwiperSlide key={item._id}>
                                        <div className="relative w-full h-full p-2  flex flex-col">
                                            <div className="flex-1 relative rounded-[2rem] md:rounded-[3rem] overflow-hidden premium-border-glow shadow-2xl bg-black/20">
                                                <Image
                                                    src={item.url}
                                                    alt={item.title || "Gallery item"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="mt-8 text-center space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">{formatDate(item.createdAt)}</p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </SwiperComp>

                            {/* Nav Buttons */}
                            <div className="absolute inset-y-0 -left-6 md:-left-20 hidden lg:flex items-center z-50">
                                <button className="swiper-btn-prev group p-5 rounded-full bg-white/5 text-white hover:bg-primary hover:text-charcoal transition-all shadow-xl">
                                    <MoveLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="absolute inset-y-0 -right-6 md:-right-20 hidden lg:flex items-center z-50">
                                <button className="swiper-btn-next group p-5 rounded-full bg-white/5 text-white hover:bg-primary hover:text-charcoal transition-all shadow-xl">
                                    <MoveRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
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
