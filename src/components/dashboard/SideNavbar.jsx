"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  UserCog,
  Home,
  Building,
  Users,
  HandCoins,
  BarChart3,
  Images,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Announcement Management",
    href: "/dashboard/announcementform",
    icon: Megaphone,
  },
    {
    title: "Dashboard",
    href: "/dashboard/reports-property-commission",
    icon: BarChart3,
  },
  {
    title: "Client Management",
    href: "/dashboard/Islamabad-prime-builder-client-user",
    icon: Users,
  },
  {
    title: "Broker Management",
    href: "/dashboard/islamabad-prime-builder-broker-manaegment",
    icon: UserCog,
  },
  {
    title: "Images Management",
    href: "/dashboard/property-images",
    icon: Images,
  },
  {
    title: "Messages",
    href: "/dashboard/message",
    icon: MessageSquareText,
  },
  {
    title: "Property List",
    href: "/dashboard/propertylist",
    icon: Building,
  },
  {
    title: "Add Property",
    href: "/dashboard/properityform",
    icon: Home,
  },
  {
    title: "Reports Broker Commission",
    href: "/dashboard/reports-broker-commission",
    icon: HandCoins,
  },
];
const SideNavbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (user?.role !== "super-admin") {
    return null;
  }

  return (
    <div
      className={`relative hidden h-screen shrink-0 border-r border-[#c29e6d]/10 bg-[#08211e] text-white transition-all duration-300 lg:flex lg:flex-col ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
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

      <div
        className={`flex h-24 items-center border-b border-[#c29e6d]/10 ${isCollapsed ? "justify-center px-2" : "px-6"}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="line-clamp-1 text-sm font-bold tracking-tight text-[#c29e6d]">
                ISLAMABAD PRIME
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Builders
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-2 py-2 ${isCollapsed ? "px-3" : "px-4"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center rounded-2xl p-3 text-sm font-medium transition-all duration-300 ${active
                ? "border border-[#c29e6d]/30 bg-[#c29e6d] text-[#08211e] shadow-lg"
                : "text-white/75 hover:bg-white/5 hover:text-[#c29e6d]"
                } ${isCollapsed ? "justify-center" : "gap-4"}`}
            >
              {/* Icon + Tooltip */}
              <div className="relative flex items-center justify-center group/icon">
                <Icon
                  size={20}
                  className={`${active ? "text-[#08211e]" : "text-[#c29e6d]"
                    } shrink-0`}
                />
                {isCollapsed && (
                  <div
                    className="pointer-events-none fixed left-15 mt-10 ml-4 -translate-y-1/2 invisible opacity-0 translate-x-2 group-hover/icon:visible group-hover/icon:opacity-100 group-hover/icon:translate-x-0 transition-all duration-300 z-[9999]"
                  >
                    <div className="relative whitespace-nowrap rounded-xl border border-[#c29e6d] bg-white px-4 py-2 shadow-2xl">
                      <span className="text-sm font-semibold text-[#08211e]">
                        {item.title}
                      </span>

                      {/* Arrow */}
                      <div
                        className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-b border-[#c29e6d] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SideNavbar;
