"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Settings, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const TopNavbar = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const userName = user?.name || "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setOpenDropdown(false);
  };

  return (
    <div className="w-full   px-4 py-4 md:px-6 md:py-5">
      <div className="flex h-[80px] items-center justify-between rounded-[2rem] px-6 premium-border-glow">
        <Link href="/dashboard" className="group">
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl  bg-white p-1 transition-transform group-hover:scale-105 ">
              <Image src="/images/logo.png" alt="Logo" fill sizes="48px" className="object-contain" />
            </div>
            <div className="hidden md:block">
              <h2 className="font-serif text-lg font-semibold leading-tight tracking-tight text-charcoal  transition-colors">
                ISLAMABAD PRIME
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/40">Builders</p>
            </div>
          </div>
        </Link>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-6">
          <div/>
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="group flex items-center gap-3 cursor-pointer py-2 pl-2 pr-3 rounded-2xl hover:bg-primary/5 transition-all"
            >
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-charcoal text-primary font-serif font-bold text-lg ring-2 ring-primary/20 group-hover:ring-primary transition-all shadow-lg">
                  {getInitials(userName)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              
              <div className="hidden sm:block text-left">
                <p className="text-md font-bold text-charcoal leading-none mb-1 group-hover:text-primary transition-colors">
                  {userName}
                </p>
              </div>
              
              <ChevronDown size={14} className={`text-charcoal/30 transition-transform duration-300 ${openDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {openDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 glass rounded-2xl premium-border-glow shadow-2xl overflow-hidden bg-white p-2 z-50"
                >

                  <Link href="/dashboard/profile" onClick={() => setOpenDropdown(false)}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold text-charcoal hover:bg-primary hover:text-white rounded-xl transition-all group">
                      <User size={16} className="text-primary group-hover:text-white" />
                      View Profile
                    </button>
                  </Link>

                  <div className="h-[1px] bg-primary/5 my-2 mx-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                  >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
