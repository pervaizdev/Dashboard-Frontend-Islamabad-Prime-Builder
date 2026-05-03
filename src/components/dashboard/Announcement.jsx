"use client";

import { useState, useEffect } from "react";
import { Megaphone, X, Bell, Settings, Loader2, Info, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { notificationAPI } from "@/api/notification";
import { announcementAPI } from "@/api/annoucement";
import Link from "next/link";

const AnnouncementsSection = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isSuperAdmin = user?.role === "super-admin";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        setLoading(true);
        let bannerRes, notificationRes;

        if (isAdmin) {
          // Admins see all banners
          bannerRes = await announcementAPI.getActiveAnnouncements();
        } else {
          // Regular users see active banners AND installment notifications
          const [bRes, nRes] = await Promise.all([
            announcementAPI.getActiveAnnouncements(),
            notificationAPI.getInstallmentNotifications()
          ]);
          bannerRes = bRes;
          notificationRes = nRes;
        }

        const combined = [];

        // Add Announcements/Banners
        if (bannerRes?.success && bannerRes?.banners) {
          combined.push(...bannerRes.banners.map(b => ({
            ...b,
            type: "announcement",
            // For unified display
            displayTitle: b.title,
            displayMessage: b.description,
            displayDate: b.start_datetime ? new Date(b.start_datetime).toLocaleDateString() : ""
          })));
        }

        // Add Installment Notifications (only for non-admins)
        if (notificationRes?.success && notificationRes?.notifications) {
          combined.push(...notificationRes.notifications.map(n => ({
            ...n,
            type: "notification",
            // For unified display
            displayTitle: "Installment Due",
            displayMessage: n.message,
            displayDate: n.installment_month_year?.toUpperCase()
          })));
        }

        setNotifications(combined);
      } catch (error) {
        console.error("Failed to fetch dashboard notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-2xl bg-white premium-border-glow h-full flex flex-col"
      >
        <div className="shimmer-gold px-6 py-4 flex items-center justify-between border-b border-primary/20 bg-charcoal/5">
          <div className="flex items-center gap-3">
            <div className="bg-charcoal p-2 rounded-lg shadow-sm">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal tracking-wide uppercase">NOTIFICATIONS</h3>
          </div>
          <div className="flex items-center gap-3">
            {(isSuperAdmin || isAdmin) && (
              <>
                <Link
                  href="/dashboard/message"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[8px] font-bold uppercase tracking-widest"
                >
                  <MessageSquare className="h-2.5 w-2.5" />
                
                </Link>
                <Link
                  href="/dashboard/announcementform"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[8px] font-bold uppercase tracking-widest"
                >
                  <Settings className="h-2.5 w-2.5" />
                  Manage
                </Link>
              </>
            )}
            {isAdmin ? (
              <span></span>
            ) : (
              <span className="text-[10px] font-bold text-black border border-black/10 px-2 py-1 rounded-full">{notifications.length} NEW</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-primary/5 custom-scrollbar">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ backgroundColor: "rgba(194, 158, 109, 0.03)" }}
                type="button"
                onClick={() => setSelectedNotification(item)}
                className="w-full p-5 text-left transition-all duration-300 group"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {item.type === "announcement" ? (
                      <Megaphone className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <h4 className="font-serif text-sm font-bold text-charcoal leading-snug group-hover:text-primary transition-colors">
                      {item.displayTitle}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="shrink-0 text-[10px] font-bold text-black px-2 py-0.5 rounded-md bg-slate-100 uppercase tracking-widest leading-none">
                      {item.displayDate}
                    </span>

                  </div>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-charcoal/60 font-body">
                  {item.displayMessage}
                </p>

                <div className="mt-3 flex items-center justify-between">
                </div>
              </motion.button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full opacity-40">
              <Bell className="h-12 w-12 text-charcoal/20 mb-3" />
              <p className="text-xs font-medium text-charcoal/50">No new notifications</p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setSelectedNotification(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8 sm:p-10">
                {/* Header Section */}
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm">
                    {selectedNotification.type === "announcement" ? (
                      <Megaphone className="h-7 w-7 text-yellow-600" />
                    ) : (
                      <Bell className="h-7 w-7 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-600/80 px-2 py-0.5 bg-yellow-50 rounded-md border border-yellow-500/10">
                      {selectedNotification.type === "announcement" ? "Announcement" : "System Alert"}
                    </span>

                  </div>
                </div>

                <h2 className="mb-6 font-serif text-2xl font-bold text-slate-800 leading-tight">
                  {selectedNotification.displayTitle}
                </h2>

                <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 italic">
                  <p className="text-sm font-body text-slate-600 leading-relaxed text-center">
                    "{selectedNotification.displayMessage}"
                  </p>
                </div>

                {/* Metadata Section */}               
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnnouncementsSection;
