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
      <tspan x={cx} y={cy + 16} fontSize="11" fontWeight="bold" fill="#1e293b">
        {formatFullNumber(total)}
      </tspan>
    </text>
  );
};

const CustomLegendList = ({ data, total, colors }) => {
  return (
    <div className="flex flex-col justify-center space-y-3 ml-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
      {data.map((entry, index) => {
        const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
        return (
          <div 
            key={`legend-${index}`} 
            className="flex items-start p-1 rounded-lg"
          >
            <div 
              className="w-3 h-3 rounded-full mt-1.5 mr-3 flex-shrink-0" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div>
              <div className="text-[13px] font-bold text-slate-800 leading-tight">{entry.name}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                Rs {formatFullNumber(entry.value)} ({percentage}%)
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
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col relative">
      <h3 className="text-[15px] font-bold text-slate-700 mb-6">{title}</h3>

      {/* Floating Tooltip Box at Card Level */}
      {hoveredItem && (
        <div className="absolute z-50 top-14 right-6 bg-white text-slate-800 rounded-2xl p-3.5 shadow-xl text-[12px] w-[230px] pointer-events-none transition-all duration-200 border border-slate-200/80">
          <p className="font-bold border-b border-slate-100 pb-1.5 mb-2 text-slate-800 text-center">{hoveredItem.name}</p>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-slate-800">Rs {formatFullNumber(hoveredItem.value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Percentage:</span>
              <span className="font-bold text-blue-600">
                {total > 0 ? ((hoveredItem.value / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
      
      {data.length > 0 ? (
        <div className="flex flex-row items-center w-full">
          {/* Chart Side */}
          <div className="w-[140px] h-[140px] flex-shrink-0 relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]} 
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onMouseEnter={() => setHoveredItem(entry)}
                      onMouseLeave={() => setHoveredItem(null)}
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
            <CustomLegendList data={data} total={total} colors={colors} />
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
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col h-full relative">
      <h3 className="text-[15px] font-bold text-slate-700 mb-6">{title}</h3>
      
      {/* Floating Tooltip Box at Card Level */}
      {hoveredItem && (
        <div className="absolute z-50 top-14 right-6 bg-white text-slate-800 rounded-2xl p-3.5 shadow-xl text-[12px] w-[250px] pointer-events-none transition-all duration-200 border border-slate-200/80">
          <p className="font-bold border-b border-slate-100 pb-1.5 mb-2 text-slate-800 text-center">{hoveredItem.name}</p>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Value:</span>
              <span className="font-bold text-slate-800">Rs {formatFullNumber(hoveredItem.value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Downpayment Rec:</span>
              <span className="font-bold text-[#C6A15B]">Rs {formatFullNumber(hoveredItem.downpayment_received)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Installment Rec:</span>
              <span className="font-bold text-[#1F6B4F]">Rs {formatFullNumber(hoveredItem.installment_received)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="text-slate-500">Remaining:</span>
              <span className="font-bold text-rose-600">Rs {formatFullNumber(hoveredItem.remaining_amount)}</span>
            </div>
          </div>
        </div>
      )}

      {data.length > 0 ? (
        <div className="flex flex-col space-y-5 w-full mt-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div 
                key={index} 
                className="flex items-center w-full py-1 px-1 rounded-lg"
              >
                <div className="w-[110px] text-right pr-3 text-[12px] font-bold text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </div>
                <div 
                  className="flex-1 h-3 flex items-center cursor-pointer group"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div 
                    className="h-full rounded-r-md rounded-l-sm transition-all group-hover:opacity-85 group-hover:scale-y-110" 
                    style={{ width: `${Math.max(percentage, 1)}%`, backgroundColor: colors[index % colors.length] }} 
                  />
                </div>
                <div className="w-[170px] text-right pl-3 text-[12px] font-bold text-slate-700 whitespace-nowrap">
                  Rs {formatFullNumber(item.value)} <span className="text-slate-400 font-normal">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-400 min-h-[150px]">No data available</div>
      )}
    </div>
  );
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
    { name: 'Other', value: stats.other_value || 0 }
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
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 mt-2">
        <ChartCard 
          title="Sales Contribution by Allocation"
          data={partnerData}
          total={totalPartnerOtherValue}
          colors={DONUT_COLORS_1}
          centerTitle="TOTAL SALES"
        />
        
        <ChartCard 
          title="Installments Breakdown"
          data={installmentData}
          total={totalInstallmentValue}
          colors={DONUT_COLORS_2}
          centerTitle="INSTALLMENTS"
        />

        <ChartCard 
          title="Payment Collection Breakdown"
          data={overallCollectionData}
          total={totalReceivedAmount}
          colors={DONUT_COLORS_3}
          centerTitle="TOTAL RECEIVED"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <HorizontalBarChartCard 
          title="Value by Property Type"
          data={typeData.sort((a, b) => b.value - a.value)}
          total={totalTypeValue}
          colors={['#C6A15B', '#1F6B4F', '#123D32', '#E2CE9F', '#3A8B6F']}
        />

        <HorizontalBarChartCard 
          title="Value by Category"
          data={categoryData.sort((a, b) => b.value - a.value)}
          total={totalCategoryValue}
          colors={['#C6A15B', '#123D32', '#1F6B4F', '#E2CE9F', '#3A8B6F']}
        />

        <HorizontalBarChartCard 
          title="Value by Floor"
          data={floorData.sort((a, b) => b.value - a.value)}
          total={totalFloorValue}
          colors={['#C6A15B', '#123D32', '#1F6B4F', '#E2CE9F', '#3A8B6F']}
        />
      </div>

      <PropertyCommissionTimelineChart 
        monthlyData={stats.timeline_monthly || []}
        yearlyData={stats.timeline_yearly || []}
      />
    </>
  );
};

export default PropertyCommissionCharts;
