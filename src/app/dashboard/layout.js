"use client";

import { usePathname } from "next/navigation";
import SideNavbar from "@/components/dashboard/SideNavbar";
import TopNavbar from "@/components/dashboard/TopNavbar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname.includes("proporitydetail") || pathname.includes("gallery");

  return (
    <div>
      <SideNavbar />
      <div>
        {!hideNavbar && <TopNavbar />}
        <div className="bg-slate-50">{children}</div>
      </div>
    </div>
  );
}