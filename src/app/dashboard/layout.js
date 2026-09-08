"use client";

import { usePathname } from "next/navigation";
import SideNavbar from "@/components/dashboard/SideNavbar";
import TopNavbar from "@/components/dashboard/TopNavbar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname.includes("proporitydetail") || pathname.includes("gallery");

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNavbar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {!hideNavbar && <TopNavbar />}
        {/* pb-20 on mobile so content isn't hidden behind the fixed bottom tab bar */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}