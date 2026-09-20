"use client";

import React, { useState, useEffect } from "react";
import { Landmark, CalendarCheck2, Users } from "lucide-react";
import PropertyReportComponent from "@/components/property-report";
import InstallmentPlanPage from "@/app/dashboard/installment-plan/page";
import BrokerCommissionReport from "@/components/BrokerCommissionReport";
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
      // Clear the session storage when the user navigates away from these tabs
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
    {
      id: "broker-commission",
      label: "Broker Commission Report",
      shortLabel: "Broker",
      Icon: Users,
    },
  ];
  return (
    <div className="px-4 py-6 sm:py-12 sm:px-6 lg:px-8 mb-5">
      <div className="relative w-full mb-6 sm:w-fit">
        <nav
          className="grid grid-cols-3 sm:flex w-full sm:w-auto gap-1 sm:gap-2 rounded-2xl sm:rounded-full bg-[#EEF3F1] p-1.5 shadow-inner"
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
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all duration-200 rounded-xl sm:rounded-full px-1.5 sm:px-5 py-2.5 sm:py-3.5 sm:min-w-[190px] ${
                  isActive
                    ? "bg-[#123D32] shadow-md shadow-[#123D32]/20"
                    : "bg-transparent hover:bg-white/60"
                }`}
              >
                <TabIcon
                  className={`shrink-0 h-4 w-4 sm:h-5 sm:w-5 ${isActive ? "text-[#E5C476]" : "text-[#123D32]"}`}
                />
                <span
                  className={`text-[10px] xs:text-[11px] font-extrabold sm:text-[13px] tracking-wide text-center leading-tight ${
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
        ) : activeTab === "installment" ? (
          <InstallmentPlanPage />
        ) : (
          <BrokerCommissionReport />
        )}
      </div>

      {/* AI Chatbot */}
      <IPBChatBot />
    </div>
  );
};

export default Page;