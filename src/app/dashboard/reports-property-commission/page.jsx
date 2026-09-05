"use client";

import React, { useState, useEffect } from "react";
import { Landmark, CalendarCheck2 } from "lucide-react";
import PropertyReportComponent from "@/components/property-report";
import InstallmentPlanPage from "@/app/dashboard/installment-plan/page";
import { dashboardAPI } from "@/api/dashboard";
import IPBChatBot from "@/components/IPBChatBot";

const Page = () => {
  const [activeTab, setActiveTab] = useState("property");

  useEffect(() => {
    // Clear on mount to handle the "remove if refresh" requirement
    sessionStorage.removeItem("allPropertyDetails");
    sessionStorage.removeItem("ipbChatHistory");

    const fetchAllProperties = async () => {
      try {
        const res = await dashboardAPI.getAllProperties();
        if (res.success && res.properties) {
          sessionStorage.setItem("allPropertyDetails", JSON.stringify(res.properties));
        }
      } catch (error) {
        console.error("Failed to fetch all properties for caching:", error);
      }
    };
    fetchAllProperties();

    return () => {
      // Clear the session storage when the user navigates away from these two tabs
      sessionStorage.removeItem("allPropertyDetails");
      sessionStorage.removeItem("ipbChatHistory");
    };
  }, []);

  const tabs = [
    {
      id: "property",
      label: "Property Report",
      shortLabel: "Property",
      Icon: Landmark,
    },
    {
      id: "installment",
      label: "Installment Report",
      shortLabel: "Installment",
      Icon: CalendarCheck2,
    },
  ];
  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8 mb-5">
      <div className="relative w-full mb-6 sm:w-fit">
        <nav
          className="inline-flex w-full sm:w-auto gap-2 rounded-full bg-[#EEF3F1] p-1.5 shadow-inner"
          aria-label="Dashboard Tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.Icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 sm:flex-none items-center justify-center gap-2 cursor-pointer transition-all duration-200 rounded-full px-5 py-3.5 sm:min-w-[190px] ${
                  isActive
                    ? "bg-[#123D32] shadow-md shadow-[#123D32]/20"
                    : "bg-transparent hover:bg-white/60"
                }`}
              >
                <TabIcon
                  size={20}
                  className={`shrink-0 ${isActive ? "text-[#E5C476]" : "text-[#123D32]"}`}
                />
                <span
                  className={`whitespace-nowrap text-[11px] font-bold sm:text-[13px] tracking-wide ${
                    isActive
                      ? "text-[#E5C476]"
                      : "text-[#123D32]"
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      <div>
        {activeTab === "property" ? (
          <PropertyReportComponent />
        ) : (
          <InstallmentPlanPage />
        )}
      </div>

      {/* AI Chatbot */}
      <IPBChatBot />
    </div>
  );
};

export default Page;