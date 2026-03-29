"use client";

import SideNavbar from "@/Components/SideNavbar";
import TopNavbar from "@/Components/TopNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-grid flex min-h-screen bg-slate-50">
      <SideNavbar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* <TopNavbar title="Client Dashboard" /> */}

        <div>
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </div>
    </div>
  );
}