"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  {
    title: "Profile",
    href: "/dashboard",
    icon: UserCircle2,
  },
  {
    title: "Properties",
    href: "/dashboard/properties",
    icon: Building2,
  },
];

const SideNavbar = () => {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="hidden w-60 shrink-0 border-r border-[#c29e6d]/10 bg-[#08211e] text-white lg:flex lg:flex-col"
    >
      <div className="border-b border-[#c29e6d]/10 px-6 py-8">
        <div className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Logo" width={42} height={42} />
          <div>
            <h2 className="text-base font-semibold text-[#c29e6d]">
              Islamabad Prime Builder
            </h2>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "border border-[#c29e6d]/30 bg-[#c29e6d] text-[#08211e] shadow-lg"
                  : "text-white/75 hover:bg-white/5 hover:text-[#c29e6d]"
              }`}
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default SideNavbar;