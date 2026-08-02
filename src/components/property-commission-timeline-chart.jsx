"use client";

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-[17px] font-bold text-slate-800">Collections Over Time</h3>
        
        {/* View Mode Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer shadow-sm"
          >
            <option value="monthly">Monthly (Last 12 Months)</option>
            <option value="yearly">Yearly (Last 3 Years)</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[320px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 25, right: 10, left: 10, bottom: 20 }}
            barGap={12}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="period" 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
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
              maxBarSize={42}
            >
              <LabelList dataKey="downpayment" content={<CustomBarLabel fill="#C6A15B" />} />
            </Bar>

            <Bar 
              dataKey="installment" 
              name="Installments Received" 
              fill="#1F6B4F" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={42}
            >
              <LabelList dataKey="installment" content={<CustomBarLabel fill="#1F6B4F" />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Bottom Legend */}
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
