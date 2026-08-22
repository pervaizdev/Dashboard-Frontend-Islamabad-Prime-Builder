"use client";

import React, { useState } from "react";
import Image from "next/image";
import PropertyReportComponent from "@/components/property-report";
import InstallmentPlanPage from "@/app/dashboard/installment-plan/page";

const Page = () => {
  const [activeTab, setActiveTab] = useState("property");
  const tabs = [
    {
      id: "property",
      label: "Property Report",
      shortLabel: "Property",
      icon: "/3D icons/property-report.png",
    },
    {
      id: "installment",
      label: "Installment Report",
      shortLabel: "Installment",
      icon: "/3D icons/installment-report.png",
    },
  ];
  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8 mb-5">
      <div className="relative w-full mb-5 sm:w-fit">
        <nav
          className=" grid w-full gap-1 rounded-2xl bg-[#F3F6F4] p-1.5 sm:flex sm:w-fit sm:gap-[3px] sm:rounded-none sm:bg-transparent sm:p-0"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          }}
          aria-label="Dashboard Tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex min-w-0 items-center justify-center cursor-pointer transition-all duration-100 h-[52px] flex-col gap-1 rounded-xl px-1 sm:h-auto sm:min-w-[175px] sm:flex-row sm:gap-2 sm:rounded-none sm:px-4 sm:py-2.5 sm:[clip-path:polygon(10px_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%,0_10px)] ${isActive
                  ? "bg-[#123D32] shadow-sm"
                  : "bg-transparent hover:bg-white sm:bg-[#DDE8E3] sm:hover:bg-[#D3E1DB]"
                  }`}
              >
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={28}
                  height={28}
                  className="h-5 w-5 shrink-0 object-contain sm:h-7 sm:w-7" />
                <span
                  className={`max-w-full truncate whitespace-nowrap text-[9px] font-semibold leading-none sm:text-[13px] sm:leading-normal ${isActive
                    ? "text-[#C6A15B]"
                    : "text-[#123D32]"
                    }`}
                >
                  <span className="sm:hidden">
                    {tab.shortLabel}
                  </span>
                  <span className="hidden sm:inline">
                    {tab.label}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="hidden h-[px] w-full bg-[#123D32] sm:block" />
      </div>
      <div>
        {activeTab === "property" ? (
          <PropertyReportComponent />
        ) : (
          <InstallmentPlanPage />
        )}
      </div>
    </div>
  );
};

export default Page;