import React, { useState, useEffect } from 'react';
import { 
  Building2, Wallet, PieChart, Receipt, Layers, 
  Home, Users, User, ArrowUpRight, ArrowDownRight, 
  TrendingUp, CircleDashed, Loader2 
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';

const formatCompactNumber = (number) => {
  if (number === undefined || number === null) return "0";
  if (number < 1000) {
    return number.toString();
  } else if (number >= 1000 && number < 1_000_000) {
    return (number / 1000).toFixed(1) + "K";
  } else if (number >= 1_000_000 && number < 1_000_000_000) {
    return (number / 1_000_000).toFixed(1) + "M";
  } else if (number >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(1) + "B";
  }
};

const formatFullNumber = (number) => {
  if (number === undefined || number === null) return "0.00";
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const PropertyCommissionStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="w-full flex justify-center py-10 mb-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) return null;

  const totalPropValue = stats.total_price || 0;
  
  const paidPercent = totalPropValue > 0 ? Math.round((stats.total_paid_amount / totalPropValue) * 100) : 0;
  const remPercent = totalPropValue > 0 ? Math.round((stats.total_remaining_amount / totalPropValue) * 100) : 0;
  
  const totalInst = stats.total_installment_amount || 0;
  const instPaidPercent = totalInst > 0 ? Math.round((stats.total_paid_installment_amount / totalInst) * 100) : 0;

  const totalAllocations = (stats.partner_allocation_count || 0) + (stats.other_allocation_count || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      
      {/* Card 1: Total Property Value */}
      <div className="bg-white rounded-3xl border border-[#C6A15B]/20 p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-[15px] font-bold text-[#123D32] leading-tight">Total Property<br />Value</h3>
          <div className="w-11 h-11 rounded-2xl bg-[#C6A15B]/10 text-[#C6A15B] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#123D32] mb-1.5">
            Rs. {formatCompactNumber(stats.total_price)}
          </p>
          <p className="text-[12px] italic text-slate-400">
            {formatFullNumber(stats.total_price)}
          </p>
        </div>
      </div>

      {/* Card 2: Amount Received */}
      <div className="bg-white rounded-3xl border border-[#C6A15B]/20 p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-[15px] font-bold text-[#123D32] leading-tight">Received<br />Amount</h3>
          <div className="w-11 h-11 rounded-2xl bg-[#C6A15B]/10 text-[#C6A15B] flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#123D32] mb-1.5">
            Rs. {formatCompactNumber(stats.total_paid_amount)}
          </p>
          <p className="text-[12px] italic text-slate-400">
            {formatFullNumber(stats.total_paid_amount)}
          </p>
        </div>
      </div>

      {/* Card 3: Remaining Balance */}
      <div className="bg-white rounded-3xl border border-[#C6A15B]/20 p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-[15px] font-bold text-[#123D32] leading-tight">Remaining<br />Amount</h3>
          <div className="w-11 h-11 rounded-2xl bg-[#C6A15B]/10 text-[#C6A15B] flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#123D32] mb-1.5">
            Rs. {formatCompactNumber(stats.total_remaining_amount)}
          </p>
          <p className="text-[12px] italic text-slate-400">
            {formatFullNumber(stats.total_remaining_amount)}
          </p>
        </div>
      </div>

      {/* Card 4: Installments Overview */}
      <div className="bg-white rounded-3xl border border-[#C6A15B]/20 p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-[15px] font-bold text-[#123D32] leading-tight">Installments<br />Overview</h3>
          <div className="w-11 h-11 rounded-2xl bg-[#C6A15B]/10 text-[#C6A15B] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between items-center border-b border-[#C6A15B]/10 pb-1.5">
            <span className="text-[13px] font-semibold text-slate-500">Total</span>
            <div className="text-right">
              <p className="text-[14px] font-bold text-[#123D32]">Rs. {formatCompactNumber(stats.total_installment_amount)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-[#C6A15B]/10 pb-1.5">
            <span className="text-[13px] font-semibold text-slate-500">Paid</span>
            <div className="text-right">
              <p className="text-[14px] font-bold text-[#C6A15B]">Rs. {formatCompactNumber(stats.total_paid_installment_amount)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-semibold text-slate-500">Remaining</span>
            <div className="text-right">
              <p className="text-[14px] font-bold text-[#123D32]">Rs. {formatCompactNumber(stats.total_remaining_installment_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Portfolio Summary */}
      <div className="bg-white rounded-3xl border border-[#C6A15B]/20 p-6 flex flex-col justify-between shadow-sm min-h-[160px]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-[15px] font-bold text-[#123D32] leading-tight">Portfolio<br />Summary</h3>
          <div className="w-11 h-11 rounded-2xl bg-[#C6A15B]/10 text-[#C6A15B] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        
        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-center border-b border-[#C6A15B]/10 pb-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-[#C6A15B]" />
              <span className="text-[13px] font-semibold text-slate-500">Active Properties</span>
            </div>
            <span className="text-[15px] font-bold text-[#123D32]">{stats.total_active_property || 0}</span>
          </div>

          <div className="flex justify-between items-center border-b border-[#C6A15B]/10 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C6A15B]" />
              <span className="text-[13px] font-semibold text-slate-500">Partners</span>
            </div>
            <span className="text-[15px] font-bold text-[#123D32]">{stats.partner_allocation_count || 0}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C6A15B]" />
              <span className="text-[13px] font-semibold text-slate-500">Others</span>
            </div>
            <span className="text-[15px] font-bold text-[#123D32]">{stats.other_allocation_count || 0}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PropertyCommissionStats;
