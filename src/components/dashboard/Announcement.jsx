"use client";

import { useState } from "react";
import { Megaphone, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { announcements } from "@/data/OverViewData";

const AnnouncementsSection = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-2xl bg-white premium-border-glow h-full"
      >
        <div className="shimmer-gold px-6 py-4 flex items-center justify-between border-b border-primary/20">
          <div className="flex items-center gap-3">
             <div className="bg-charcoal p-2 rounded-lg">
                <Bell className="h-4 w-4 text-primary" />
             </div>
             <h3 className="font-serif text-base font-bold text-charcoal tracking-wide">NOTIFICATIONS</h3>
          </div>
          <span className="text-[10px] font-bold text-black">{announcements.length} NEW</span>
        </div>

        <div className="divide-y divide-primary/5">
          {announcements.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ backgroundColor: "rgba(194, 158, 109, 0.03)" }}
              type="button"
              onClick={() => setSelectedAnnouncement(item)}
              className="w-full p-5 text-left transition-all duration-300"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h4 className="font-serif text-sm font-bold text-charcoal leading-snug group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <span className="shrink-0 text-[9px] font-bold text-black bg-primary/5 px-2 py-1 rounded">
                  {item.date || "News"}
                </span>
              </div>

              <p className="line-clamp-2 text-xs leading-relaxed text-charcoal/50 font-body">
                {item.text}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-md"
              onClick={() => setSelectedAnnouncement(null)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl glass rounded-[2rem] p-8 shadow-2xl premium-border-glow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 shimmer-gold" />
              
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute right-6 top-6 rounded-full p-2 text-charcoal/40 hover:bg-primary/10 hover:text-primary transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Announcement</span>
                  <p className="text-xs font-semibold text-charcoal/40">{selectedAnnouncement.date || "Notification"}</p>
                </div>
              </div>

              <h2 className="mb-6 pr-8 font-serif text-2xl font-bold text-charcoal leading-tight">
                {selectedAnnouncement.title}
              </h2>

              <div className="prose prose-sm font-body text-charcoal/70 leading-relaxed max-h-[40vh] overflow-y-auto pr-4 scrollbar-thin">
                {selectedAnnouncement.text}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnnouncementsSection;
