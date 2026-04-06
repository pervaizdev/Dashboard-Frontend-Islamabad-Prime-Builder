"use client";

import { useState, useEffect } from "react";
import { Megaphone, X, Bell, Settings, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { notificationAPI } from "@/api/notification";

const AnnouncementsSection = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isSuperAdmin = user?.role === "super-admin";

  useEffect(() => {
    const fetchNotifications = async () => {
      // Don't hit API if admin or super-admin
      if (!user || isAdmin) {
        setNotifications([]);
        return;
      }

      try {
        setLoading(true);
        const data = await notificationAPI.getInstallmentNotifications();
        if (data?.success) {
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
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
            {isSuperAdmin && (
              <button 
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[10px] font-bold uppercase tracking-wider"
              >
                <Settings className="h-3 w-3" />
                Manage Notifications
              </button>
            )}
            {!isAdmin && (
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
                  <h4 className="font-serif text-sm font-bold text-charcoal leading-snug group-hover:text-primary transition-colors">
                    Installment Due
                  </h4>
                  <span className="shrink-0 text-[10px] font-bold text-black px-2.5 py-1 rounded-md ">
                    {item.installment_month_year?.toUpperCase()}
                  </span>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-charcoal/60 font-body">
                  {item.message}
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
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
              onClick={() => setSelectedNotification(null)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass rounded-[2.5rem] p-10 shadow-2xl premium-border-glow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="absolute right-8 top-8 rounded-full p-2 text-charcoal/40 hover:bg-primary/10 hover:text-primary transition-all backdrop-blur-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-8 flex items-center gap-4">
                <div className="rounded-2xl bg-primary/10 p-4 shadow-sm border border-primary/5">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Notification Detail</span>
                  <p className="text-xs font-bold text-charcoal/40">{selectedNotification.property_type} - {selectedNotification.property_number}</p>
                </div>
              </div>

              <h2 className="mb-8 pr-12 font-serif text-3xl font-bold text-charcoal leading-[1.2] tracking-tight">
                Installment Payment Request
              </h2>

              <div className="p-6 rounded-3xl bg-charcoal/5 border border-charcoal/5 mb-8">
                <p className="text-sm font-body text-charcoal/80 leading-relaxed text-center italic">
                  "{selectedNotification.message}"
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="flex-1 bg-charcoal text-white py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-charcoal/90 transition-all shadow-lg"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnnouncementsSection;
