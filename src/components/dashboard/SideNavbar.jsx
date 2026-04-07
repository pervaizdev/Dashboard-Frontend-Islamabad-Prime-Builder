"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    title: "OverView",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Add Client",
    href: "/dashboard/signup",
    icon: User,
  },
  {
    title: "Add Property",
    href: "/dashboard/properityform",
    icon: Plus,
  },
  {
    title: "Add Announcement",
    href: "/dashboard/announcementform",
    icon: Plus,
  },
  {
    title: "Add Broker",
    href: "/dashboard/brokerform",
    icon: User,
  },
  {
      title: "Client List",
      href: "/dashboard/clientlist",
      icon: User,
  },
  {
      title: "Property List",
      href: "/dashboard/propertylist",
      icon: Plus,
  },
];

const SideNavbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show sidebar for super-admin
  if (user?.role !== "super-admin") {
    return null;
  }

  return (
    <div
      className={`relative hidden h-screen shrink-0 border-r border-[#c29e6d]/10 bg-[#08211e] text-white transition-all duration-300 lg:flex lg:flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-[#c29e6d]/20 bg-[#c29e6d] text-[#08211e] shadow-xl transition-all hover:scale-110 active:scale-95"
      >
        {isCollapsed ? (
          <ChevronRight size={16} strokeWidth={3} />
        ) : (
          <ChevronLeft size={16} strokeWidth={3} />
        )}
      </button>

      {/* Logo Section */}
      <div className={`flex h-24 items-center border-b border-[#c29e6d]/10 ${isCollapsed ? "justify-center px-2" : "px-6"}`}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image src="/images/logo.png" alt="Logo" width={42} height={42} className="object-contain" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="line-clamp-1 text-sm font-bold tracking-tight text-[#c29e6d]">
                ISLAMABAD PRIME
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Builders</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation section */}
      <nav className={`flex-1 space-y-2 py-8 ${isCollapsed ? "px-3" : "px-4"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center rounded-2xl p-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "border border-[#c29e6d]/30 bg-[#c29e6d] text-[#08211e] shadow-lg"
                  : "text-white/75 hover:bg-white/5 hover:text-[#c29e6d]"
              } ${isCollapsed ? "justify-center" : "gap-4"}`}
            >
              <Icon size={22} className={`${active ? "text-[#08211e]" : "text-[#c29e6d]"} shrink-0`} />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="invisible absolute left-full z-[100] ml-4 whitespace-nowrap rounded-lg bg-[#c29e6d] px-3 py-2 text-xs font-bold text-[#08211e] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-1">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SideNavbar;