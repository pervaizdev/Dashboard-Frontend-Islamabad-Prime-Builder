"use client";

import React, { useState } from "react";
import Image from "next/image";
import PropertyReportComponent from "@/components/property-report";
import InstallmentPlanPage from "@/app/dashboard/installment-plan/page";

const Page = () => {
  const [activeTab, setActiveTab] = useState("property");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sleek Underlined Tabs (matching reference style) */}
     <nav
  className="grid w-full grid-cols-2 gap-1 rounded-xl bg-[#F3F6F4] p-2 sm:inline-grid sm:w-auto"
  aria-label="Dashboard Tabs"
>
  {/* Property Report */}
  <button
    type="button"
    onClick={() => setActiveTab("property")}
    className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-center cursor-pointer transition-all duration-200 sm:min-w-[170px] sm:px-3 ${
      activeTab === "property"
        ? "bg-[#123D32] shadow-sm"
        : "bg-transparent hover:bg-white"
    }`}
  >
    <Image
      src="/3D icons/property-report.png"
      alt="Property Report"
      width={28}
      height={28}
      className="h-6 w-6 shrink-0 object-contain sm:h-7 sm:w-7"
    />

    <span
      className={`min-w-0 truncate text-[10px] font-semibold sm:text-[13px] ${
        activeTab === "property"
          ? "text-[#C6A15B]"
          : "text-[#123D32]"
      }`}
    >
      Property Report
    </span>
  </button>

  {/* Installment Report */}
  <button
    type="button"
    onClick={() => setActiveTab("installment")}
    className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-center cursor-pointer transition-all duration-200 sm:min-w-[170px] sm:px-3 ${
      activeTab === "installment"
        ? "bg-[#123D32] shadow-sm"
        : "bg-transparent hover:bg-white"
    }`}
  >
    <Image
      src="/3D icons/installment-report.png"
      alt="Installment Report"
      width={28}
      height={28}
      className="h-6 w-6 shrink-0 object-contain sm:h-7 sm:w-7"
    />

    <span
      className={`min-w-0 truncate text-[10px] font-semibold sm:text-[13px] ${
        activeTab === "installment"
          ? "text-[#C6A15B]"
          : "text-[#123D32]"
      }`}
    >
      Installment Report
    </span>
  </button>
</nav>
      {/* Component Rendering */}
      {activeTab === "property" ? (
        <PropertyReportComponent />
      ) : (
        <InstallmentPlanPage />
      )}
    </div>
  );
};

export default Page;