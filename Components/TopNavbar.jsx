"use client";

import { Bell } from "lucide-react";
import { motion } from "framer-motion";

const TopNavbar = ({ title = "Dashboard", profile }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-[#08211e] px-4 py-5 md:px-8"
    >
      <div className="rounded-3xl border border-[#c29e6d]/20 bg-[#f8f6f2] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c29e6d]">
              Client Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c29e6d]/20 bg-white text-[#08211e] transition hover:-translate-y-0.5 hover:shadow-md">
              <Bell size={18} />
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-[#c29e6d]/20 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08211e] text-sm font-bold text-[#c29e6d]">
                {profile?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-[#08211e]">
                  {profile?.name || "Client User"}
                </p>
                <p className="text-xs text-slate-500">Premium Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;