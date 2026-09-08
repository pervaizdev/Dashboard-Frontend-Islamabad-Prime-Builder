"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label
} from 'recharts';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import PropertyCommissionTimelineChart from './property-commission-timeline-chart';

const DONUT_COLORS_1 = ['#C6A15B', '#1F6B4F', '#123D32', '#E2CE9F', '#3A8B6F'];
const DONUT_COLORS_2 = ['#C6A15B', '#1F6B4F', '#123D32', '#E2CE9F', '#3A8B6F'];
const DONUT_COLORS_3 = ['#C6A15B', '#1F6B4F', '#123D32', '#E2CE9F', '#3A8B6F'];

const formatFullNumber = (number) => {
  if (number === undefined || number === null) return "0.00";
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatCompactNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return "0.00";
  const absVal = Math.abs(number);
  if (absVal >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(1) + "B";
  }
  if (absVal >= 1_000_000) {
    return (number / 1_000_000).toFixed(1) + "M";
  }
  if (absVal >= 1_000) {
    return (number / 1_000).toFixed(1) + "K";
  }
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl">
        <p className="font-semibold text-slate-700">{payload[0].name}</p>
        <p className="text-slate-600">
          Rs {formatFullNumber(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom labels for the center of the pie charts
const CustomCenterLabel = (props) => {
  const { viewBox, total, title } = props;
  const cx = viewBox?.cx || props.cx || 70;
  const cy = viewBox?.cy || props.cy || 70;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} y={cy - 14} fontSize="9" fontWeight="bold" fill="#64748b" className="uppercase tracking-wider">
        {title}
      </tspan>
      <tspan x={cx} y={cy + 2} fontSize="10" fontWeight="bold" fill="#64748b">Rs</tspan>
      <tspan x={cx} y={cy + 17} fontSize="13" fontWeight="bold" fill="#1e293b">
        {formatCompactNumber(total)}
      </tspan>
    </text>
  );
};

const CustomLegendList = ({ data, total, colors, hoveredItem, setHoveredItem }) => {
  return (
    <div className="flex flex-col justify-center space-y-2.5 ml-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
      {data.map((entry, index) => {
        const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
        const isActive = hoveredItem?.name === entry.name;
        return (
          <div
            key={`legend-${index}`}
            onClick={() => setHoveredItem(entry)}
            onMouseEnter={() => setHoveredItem(entry)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-start gap-2.5 cursor-pointer rounded-xl px-2.5 py-1.5 transition-all ${isActive ? "bg-slate-50 ring-1 ring-slate-200/80 shadow-sm" : "hover:bg-slate-50/60"
              }`}
          >
            <div
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div className="overflow-hidden">
              <div className="text-[12px] font-semibold text-slate-500 leading-tight">{entry.name}</div>
              <div className="text-[12px] font-bold text-slate-900 leading-tight mt-0.5">
                Rs {formatFullNumber(entry.value)} <span className="text-[11px] font-semibold text-slate-500 ml-1">({percentage}%)</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChartCard = ({ title, data, total, colors, centerTitle }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col relative"
      onMouseLeave={() => setHoveredItem(null)}
    >
      <h3 className="text-[15px] font-bold text-slate-700 mb-6">{title}</h3>

      {data.length > 0 ? (
        <div className="flex flex-row items-center w-full ms-7">
          {/* Chart Side */}
          <div className="w-[140px] h-[140px] flex-shrink-0 relative -ml-4 outline-none focus:outline-none focus:ring-0 [&_*]:outline-none [&_*]:ring-0 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-sector]:outline-none">
            <ResponsiveContainer width="100%" height="100%" tabIndex={-1} style={{ outline: 'none', border: 'none' }}>
              <PieChart tabIndex={-1} style={{ outline: 'none', border: 'none' }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  style={{ outline: 'none' }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      className="cursor-pointer transition-opacity duration-200 focus:outline-none"
                      style={{ outline: 'none' }}
                      opacity={hoveredItem && hoveredItem.name !== entry.name ? 0.35 : 1}
                      onClick={() => setHoveredItem(entry)}
                      onMouseEnter={() => setHoveredItem(entry)}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => <CustomCenterLabel viewBox={viewBox} total={total} title={centerTitle} />}
                    position="center"
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Side */}
          <div className="flex-1">
            <CustomLegendList
              data={data}
              total={total}
              colors={colors}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center text-slate-400">No data available</div>
      )}
    </div>
  );
};

const HorizontalBarChartCard = ({ title, data, total, colors }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col h-full relative"
      onMouseLeave={() => setHoveredItem(null)}
    >
      <h3 className="text-[15px] font-bold text-slate-700 mb-3">
        {title}
      </h3>

      {/* Floating Tooltip Box at Card Level */}
      {hoveredItem && (
        <div
          className="absolute z-50 top-12 left-3 right-3 sm:left-auto sm:right-5 sm:w-[250px] bg-white text-slate-800 rounded-2xl p-3.5 shadow-xl text-[12px] pointer-events-none transition-all duration-200 border border-slate-200/80"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span className="font-bold text-slate-800">{hoveredItem.name}</span>
          </div>

          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Value:</span>
              <span className="font-bold text-slate-800">
                Rs {formatFullNumber(hoveredItem.value)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Downpayment Rec:</span>
              <span className="font-bold text-[#C6A15B]">
                Rs {formatFullNumber(hoveredItem.downpayment_received)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Installment Rec:</span>
              <span className="font-bold text-[#1F6B4F]">
                Rs {formatFullNumber(hoveredItem.installment_received)}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="text-slate-500">Remaining:</span>
              <span className="font-bold text-rose-600">
                Rs {formatFullNumber(hoveredItem.remaining_amount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {data.length > 0 ? (
        <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? (Number(item.value || 0) / total) * 100 : 0;

            const fillWidth =
              percentage > 0
                ? Math.min(Math.max(percentage, 1), 100)
                : 0;

            const isSelected = hoveredItem?.name === item.name;

            return (
              <div
                key={index}
                onClick={() => setHoveredItem(item)}
                onMouseEnter={() => setHoveredItem(item)}
                className={`grid grid-cols-[90px_minmax(110px,1fr)_50px] items-center gap-3 w-full min-h-[32px] cursor-pointer rounded-xl px-2 py-1 transition-all ${
                  isSelected ? "bg-slate-50 ring-1 ring-slate-200/80 shadow-sm" : "hover:bg-slate-50/60"
                }`}
              >
                {/* Item Name */}
                <div
                  className="text-left text-[12px] font-bold text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis"
                  title={item.name}
                >
                  {item.name}
                </div>

                {/* Progress Track and Fill */}
                <div className="relative w-full h-[8px] bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 group-hover:opacity-85"
                    style={{
                      width: `${fillWidth}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>

                {/* Percentage */}
                <div className="text-right text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-400 min-h-[120px]">
          No data available
        </div>
      )}
    </div>
  );
};

// Helper to determine logical floor order
const getFloorOrder = (floorName) => {
  if (!floorName) return 9999;

  const name = String(floorName).trim().toLowerCase();

  // Lower Ground first
  if (name === "lower ground" || name === "lg") return -1;

  // Ground Floor second
  if (
    name === "ground" ||
    name === "ground floor" ||
    name === "gf" ||
    name === "g"
  ) {
    return 0;
  }

  // Numbered floors
  const match = name.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }

  // Any other values go to the end
  return 9999;
};

const sortFloorsLogically = (floors) => {
  return [...floors].sort((a, b) => {
    const orderA = getFloorOrder(a.name);
    const orderB = getFloorOrder(b.name);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
  });
};

const PropertyCommissionCharts = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="w-full flex justify-center py-10 my-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) return null;

  // Chart 1: Partner vs Other value
  const partnerData = [
    { name: 'Partner', value: stats.partner_value || 0 },
    { name: 'Client', value: stats.other_value || 0 }
  ];
  const totalPartnerOtherValue = (stats.partner_value || 0) + (stats.other_value || 0);

  // Chart 2: Installments Paid vs Remaining
  const installmentData = [
    { name: 'Paid Installments', value: stats.total_paid_installment_amount || 0 },
    { name: 'Remaining Installments', value: stats.total_remaining_installment_amount || 0 }
  ];
  const totalInstallmentValue = stats.total_installment_amount || 0;

  // Chart 3: Overall Payment Collection Breakdown
  const totalDownpaymentPaid = (stats.total_paid_amount || 0) - (stats.total_paid_installment_amount || 0);
  const overallCollectionData = [
    { name: 'Downpayment Received', value: totalDownpaymentPaid },
    { name: 'Installments Received', value: stats.total_paid_installment_amount || 0 }
  ];
  const totalReceivedAmount = stats.total_paid_amount || 0;

  // Chart 4: Type Wise
  const typeData = stats.type_wise || [];
  const totalTypeValue = typeData.reduce((sum, item) => sum + item.value, 0);

  // Chart 5: Category Wise
  const categoryData = stats.category_wise || [];
  const totalCategoryValue = categoryData.reduce((sum, item) => sum + item.value, 0);

  // Chart 6: Floor Wise
  const floorData = stats.floor_wise || [];
  const totalFloorValue = floorData.reduce((sum, item) => sum + item.value, 0);


  return (
    <>
      <PropertyCommissionTimelineChart
        monthlyData={stats.timeline_monthly || []}
        yearlyData={stats.timeline_yearly || []}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 mt-2">
        <ChartCard
          title="Sales Contribution by Allocation"
          data={partnerData}
          total={totalPartnerOtherValue}
          colors={DONUT_COLORS_1}
          centerTitle="TOTAL"
        />

        <ChartCard
          title="Installments Breakdown"
          data={installmentData}
          total={totalInstallmentValue}
          colors={DONUT_COLORS_2}
          centerTitle="TOTAL"
        />

        <ChartCard
          title="Payment Collection Breakdown"
          data={overallCollectionData}
          total={totalReceivedAmount}
          colors={DONUT_COLORS_3}
          centerTitle="TOTAL"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <HorizontalBarChartCard
          title="Value by Property Type"
          data={[...typeData].sort((a, b) => b.value - a.value)}
          total={totalTypeValue}
          colors={['#C6A15B', '#1F6B4F', '#123D32']}
        />

        <HorizontalBarChartCard
          title="Value by Category"
          data={[...categoryData].sort((a, b) => b.value - a.value)}
          total={totalCategoryValue}
          colors={['#C6A15B', '#1F6B4F', '#123D32']}
        />

        <HorizontalBarChartCard
          title="Value by Floor"
          data={sortFloorsLogically(floorData)}
          total={totalFloorValue}
          colors={['#C6A15B', '#1F6B4F', '#123D32']}
        />
      </div>


    </>
  );
};

export default PropertyCommissionCharts;
