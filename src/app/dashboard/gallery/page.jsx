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

const galleryData = [
    { id: 1, image: "/images/building2.png", date: "25 MARCH 2026", title: "Facade View", span: "md:col-span-1 md:row-span-1" },
    { id: 2, image: "/images/building2.png", date: "24 MARCH 2026", title: "Main Lobby", span: "md:col-span-2 md:row-span-1" },
    { id: 3, image: "/images/building2.png", date: "23 MARCH 2026", title: "Penthouse Suite", span: "md:col-span-1 md:row-span-2" },
    { id: 4, image: "/images/building2.png", date: "22 MARCH 2026", title: "Evening Terrace", span: "md:col-span-1 md:row-span-1" },
    { id: 5, image: "/images/building2.png", date: "21 MARCH 2026", title: "Poolside Zen", span: "md:col-span-1 md:row-span-1" },
    { id: 6, image: "/images/building2.png", date: "20 MARCH 2026", title: "Structural Detail", span: "md:col-span-2 md:row-span-1" },
    { id: 7, image: "/images/building2.png", date: "19 MARCH 2026", title: "Aerial Perspective", span: "md:col-span-1 md:row-span-1" },
    { id: 8, image: "/images/building2.png", date: "18 MARCH 2026", title: "Atrium Light", span: "md:col-span-1 md:row-span-1" },
];

const GalleryPage = () => {
    const [selectedIdx, setSelectedIdx] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState("Recent");

    const tabs = ["Recent", "1 month ago", "3 months ago"];

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

    return (
        <div className=" min-h-screen px-4 py-8 lg:px-16 space-y-12">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header & Navigation */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                             <div className="h-px w-12 bg-primary/30" />
                             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Private Collection</p>
                        </div>
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-charcoal md:text-6xl">
                            Architectural <span className="text-primary italic">Gallery</span>
                        </h1>
                        
                        <div className="flex items-center gap-10 pt-4 border-t border-primary/10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        activeTab === tab ? "text-primary" : "text-charcoal/40 hover:text-charcoal"
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
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[300px] md:auto-rows-[350px]"
                >
                    {galleryData.map((item, index) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            onClick={() => setSelectedIdx(index)}
                            className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer premium-border-glow bg-white shadow-xl ${item.span}`}
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-charcoal/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                    <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{item.date}</p>
                                        <h3 className="font-serif text-lg font-bold italic">{item.title}</h3>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <Maximize2 size={20} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Premium Lightbox */}
            <AnimatePresence>
                {selectedIdx !== null && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-9999 bg-charcoal/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 shimmer-gold z-10000" />
                        
                        <button
                            onClick={() => setSelectedIdx(null)}
                            className="absolute top-8 right-8 text-white/50 hover:text-primary transition-all z-10000 bg-white/5 p-4 rounded-full backdrop-blur-md"
                        >
                            <X size={28} />
                        </button>

                        <div className="w-full h-full max-w-7xl relative">
                            <SwiperComp
                                initialSlide={selectedIdx}
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
                                {galleryData.map((item) => (
                                    <SwiperSlide key={item.id}>
                                        <div className="relative w-full h-full p-4 flex flex-col">
                                            <div className="flex-1 relative rounded-[3rem] overflow-hidden premium-border-glow shadow-2xl">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    sizes="(max-width: 1280px) 100vw, 1280px"
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="mt-8 text-center space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">{item.date}</p>
                                                <h2 className="font-serif text-3xl font-bold text-white italic">{item.title}</h2>
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


