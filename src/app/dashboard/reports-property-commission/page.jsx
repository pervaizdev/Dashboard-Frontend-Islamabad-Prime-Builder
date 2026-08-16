"use client";

import React, { useState } from "react";
import PropertyReportComponent from "@/components/property-report";
import InstallmentPlanPage from "@/app/dashboard/installment-plan/page";
import { Building2, Receipt } from "lucide-react";

const Page = () => {
  const [activeTab, setActiveTab] = useState("property");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sleek Underlined Tabs (matching reference style) */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Dashboard Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("property")}
            className={`group inline-flex items-center gap-2.5 py-4 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === "property"
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Building2
              className={`h-4 w-4 transition-colors ${
                activeTab === "property"
                  ? "text-emerald-600"
                  : "text-slate-400 group-hover:text-slate-500"
              }`}
            />
            <span>Property Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("installment")}
            className={`group inline-flex items-center gap-2.5 py-4 border-b-2 font-medium text-sm transition-all cursor-pointer ${
              activeTab === "installment"
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Receipt
              className={`h-4 w-4 transition-colors ${
                activeTab === "installment"
                  ? "text-emerald-600"
                  : "text-slate-400 group-hover:text-slate-500"
              }`}
            />
            <span>Installment Report</span>
          </button>
        </nav>
      </div>

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