"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, X, MoveLeft, MoveRight, Search } from "lucide-react";
import { Swiper as SwiperComp, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


const galleryData = [
  { id: 1, image: "/images/building2.png", date: "DATE: 25 MARCH 2026", span: "row-span-1 col-span-1" },
  { id: 2, image: "/images/building2.png", date: "DATE: 24 MARCH 2026", span: "row-span-1 col-span-2" },
  { id: 3, image: "/images/building2.png", date: "DATE: 23 MARCH 2026", span: "row-span-2 col-span-1" },
  { id: 4, image: "/images/building2.png", date: "DATE: 22 MARCH 2026", span: "row-span-1 col-span-1" },
  { id: 5, image: "/images/building2.png", date: "DATE: 21 MARCH 2026", span: "row-span-1 col-span-1" },
  { id: 6, image: "/images/building2.png", date: "DATE: 20 MARCH 2026", span: "row-span-1 col-span-1" },
  { id: 7, image: "/images/building2.png", date: "DATE: 19 MARCH 2026", span: "row-span-1 col-span-1" },
  { id: 8, image: "/images/building2.png", date: "DATE: 18 MARCH 2026", span: "row-span-1 col-span-1" },
  { id: 9, image: "/images/building2.png", date: "DATE: 17 MARCH 2026", span: "row-span-1 col-span-1" },
];

const GalleryPage = () => {
    const [selectedIdx, setSelectedIdx] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState("Recent");

    const tabs = ["Recent", "1 month ago", "3 months ago"];

    return (
        <div className="px-6 py-8 lg:px-12 bg-white min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header Section from Image */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <Link href="/dashboard" className="text-slate-400 hover:text-black">
                                <ChevronLeft size={24} />
                             </Link>
                             <h1 className="text-3xl font-bold text-black">Photos</h1>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-sm font-semibold ${
                                        activeTab === tab ? "text-emerald-500 underline underline-offset-8" : "text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search photos"
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-slate-600"
                        />
                    </div>
                </div>

                {/* Grid Layout inspired by image */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
                    {galleryData.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedIdx(index)}
                            className={`group relative rounded-lg overflow-hidden cursor-pointer bg-slate-100 ${item.span || "col-span-1 row-span-1"}`}
                        >
                            <Image
                                src={item.image}
                                alt={`Photo ${item.id}`}
                                fill
                                className="object-cover group-hover:scale-105"
                            />

                            {/* Bottom Hover Label (70px high as requested previously) */}
                            <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-black/60 backdrop-blur-sm translate-y-full group-hover:translate-y-0 flex items-center px-6">
                                <span className="text-white text-xs font-bold tracking-widest">
                                    {item.date}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fullscreen Swiper Modal (Kept from previous version) */}
            {selectedIdx !== null && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedIdx(null)}
                        className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2"
                    >
                        <X size={32} />
                    </button>

                    <div className="w-full h-full max-w-6xl max-h-[85vh] relative">
                        <SwiperComp
                            initialSlide={selectedIdx}
                            modules={[Navigation, Pagination]}
                            navigation={{
                                prevEl: '.swiper-btn-prev',
                                nextEl: '.swiper-btn-next',
                            }}
                            pagination={{ clickable: true }}
                            className="h-full w-full"
                        >
                            {galleryData.map((item) => (
                                <SwiperSlide key={item.id} className="flex items-center justify-center">
                                    <div className="relative w-full h-full p-4">
                                        <Image
                                            src={item.image}
                                            alt="Fullscreen View"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </SwiperComp>

                        <div className="absolute inset-y-0 -left-16 hidden xl:flex items-center">
                            <button className="swiper-btn-prev p-3 rounded-full bg-white/5 text-white hover:bg-emerald-500">
                                <MoveLeft size={20} />
                            </button>
                        </div>
                        <div className="absolute inset-y-0 -right-16 hidden xl:flex items-center">
                            <button className="swiper-btn-next p-3 rounded-full bg-white/5 text-white hover:bg-emerald-500">
                                <MoveRight size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-emerald-500 font-mono text-[10px] tracking-[0.4em] uppercase">
                        IMAGE VIEWER MODE
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;


