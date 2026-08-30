"use client";

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import { ChevronDown } from "lucide-react";

const formatCompactNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return "0.00";
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatShortNumber = (num) => {
  if (!num || num === 0) return "";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

const CustomTimelineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalVal = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-2xl text-[12px] min-w-[210px]">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="flex items-center text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-800 ml-2">Rs {formatCompactNumber(entry.value)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-slate-100 font-bold">
            <span className="text-slate-600">Total Collections:</span>
            <span className="text-[#1F6B4F] ml-2">Rs {formatCompactNumber(totalVal)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Bar Top Label
const CustomBarLabel = (props) => {
  const { x, y, width, value, fill } = props;
  if (!value || value === 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={fill}
      textAnchor="middle"
      fontSize="11"
      fontWeight="bold"
    >
      {formatShortNumber(value)}
    </text>
  );
};

const PropertyCommissionTimelineChart = ({ monthlyData = [], yearlyData = [] }) => {
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'

  const currentData = viewMode === 'monthly' ? monthlyData : yearlyData;
  const mobileData = viewMode === "monthly" ? currentData.slice(-4) : currentData;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col mb-8">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-[15px] sm:text-[17px] font-bold text-slate-800 leading-tight">
          Collections Over Time
        </h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex h-[34px] min-w-[100px] sm:min-w-[210px] items-center justify-between gap-2 rounded-lg bg-white px-3 text-[9px] sm:text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-[#C6A15B] hover:bg-[#FCFAF6] focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/15 ">
            <span className="whitespace-nowrap">
              {viewMode === "monthly"
                ? "Monthly (Last 12 Months)"
                : "Yearly (Last 3 Years)"}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-[#8F7138] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""} `}/>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 left-0 top-[calc(100%+6px)] z-50 w-[170px] sm:w-[210px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5  shadow-[0_12px_30px_rgba(15,23,42,0.14)] ">
              <button
                type="button"
                onClick={() => {
                  setViewMode("monthly");
                  setIsDropdownOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] sm:text-xs font-semibold transition-colors ${viewMode === "monthly"
                  ? "bg-[#123D32] text-[#E1BE73]"
                  : "text-[#123D32]/75 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                  }`}>
                Monthly (Last 12 Months)
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("yearly");
                  setIsDropdownOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[11px] sm:text-xs font-semibold transition-colors ${viewMode === "yearly"
                  ? "bg-[#123D32] text-[#E1BE73]"
                  : "text-[#123D32]/75 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                  }`}>
                Yearly (Last 3 Years)
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-[320px] mt-2 focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none">
        <ResponsiveContainer width="100%" height="100%" tabIndex={-1}>
          <BarChart
            tabIndex={-1}
            style={{ outline: 'none' }}
            data={isMobile ? mobileData : currentData}
            margin={{
              top: 25,
              right: isMobile ? 5 : 10,
              left: isMobile ? -10 : 10,
              bottom: 20,
            }}
            barGap={isMobile ? 6 : 12}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 9 : 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => formatShortNumber(val)}
            />
            <Tooltip content={<CustomTimelineTooltip />} />
            <Bar
              dataKey="downpayment"
              name="Downpayment Received"
              fill="#C6A15B"
              radius={[6, 6, 0, 0]}
              barSize={isMobile ? 28 : 36}
              maxBarSize={isMobile ? 32 : 36}
            >
              <LabelList dataKey="downpayment" content={<CustomBarLabel fill="#C6A15B" />} />
            </Bar>
            <Bar
              dataKey="installment"
              name="Installments Received"
              fill="#1F6B4F"
              radius={[6, 6, 0, 0]}
              barSize={isMobile ? 28 : 36}
              maxBarSize={isMobile ? 32 : 36}
            >
              <LabelList dataKey="installment" content={<CustomBarLabel fill="#1F6B4F" />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center text-xs font-semibold text-slate-700">
          <span className="w-3 h-3 rounded-md bg-[#C6A15B] mr-2 inline-block" />
          Downpayment Received
        </div>
        <div className="flex items-center text-xs font-semibold text-slate-700">
          <span className="w-3 h-3 rounded-md bg-[#1F6B4F] mr-2 inline-block" />
          Installments Received
        </div>
      </div>
    </div>
  );
};

export default PropertyCommissionTimelineChart;
