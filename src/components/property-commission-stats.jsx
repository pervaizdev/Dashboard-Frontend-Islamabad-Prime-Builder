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
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm ">
        <div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-[14px] font-bold text-slate-700 mb-4">Total Property Value</h3>
          <p className="text-3xl font-bold text-blue-600 mb-1">
            Rs. {formatCompactNumber(stats.total_price)}
          </p>
          <p className="text-[14px] font-semibold text-slate-400">
            {formatFullNumber(stats.total_price)}
          </p>
        </div>
      </div>

      {/* Card 2: Amount Received */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm ">
        <div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-[14px] font-bold text-slate-700 mb-4">Amount Received</h3>
          <p className="text-3xl font-bold text-emerald-500 mb-1">
            Rs. {formatCompactNumber(stats.total_paid_amount)}
          </p>
          <p className="text-[14px] font-semibold text-slate-400">
            {formatFullNumber(stats.total_paid_amount)}
          </p>
        </div>
        
      
      </div>

      {/* Card 3: Remaining Balance */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm ">
        <div>
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
            <PieChart className="w-5 h-5" />
          </div>
          <h3 className="text-[14px] font-bold text-slate-700 mb-4">Remaining Balance</h3>
          <p className="text-3xl font-bold text-orange-500 mb-1">
            Rs. {formatCompactNumber(stats.total_remaining_amount)}
          </p>
          <p className="text-[14px] font-semibold text-slate-400">
            {formatFullNumber(stats.total_remaining_amount)}
          </p>
        </div>
        
      
      </div>

      {/* Card 4: Installments Overview */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm ">
        <div>
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="text-[14px] font-bold text-slate-700 mb-4">Installments Overview</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[15px] font-semibold text-slate-500">Total</span>
              <div className="text-right">
                <p className="text-[15px] font-bold text-slate-800">Rs. {formatCompactNumber(stats.total_installment_amount)}</p>
                <p className="text-[12px] text-slate-400">{formatFullNumber(stats.total_installment_amount)}</p>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[15px] font-semibold text-slate-500">Paid</span>
              <div className="text-right">
                <p className="text-[15px] font-bold text-emerald-500">Rs. {formatCompactNumber(stats.total_paid_installment_amount)}</p>
                <p className="text-[12px] text-slate-400">{formatFullNumber(stats.total_paid_installment_amount)}</p>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[15px] font-semibold text-slate-500">Remaining </span>
              <div className="text-right">
                <p className="text-[15px] font-bold text-purple-600">Rs. {formatCompactNumber(stats.total_remaining_installment_amount)}</p>
                <p className="text-[12px] text-slate-400">{formatFullNumber(stats.total_remaining_installment_amount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Portfolio Summary */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm ">
        <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mb-4">
          <PieChart className="w-5 h-5" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-700 mb-6">Summary</h3>
        
        <div className="space-y-5 flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-slate-600">Active Properties</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{stats.total_active_property || 0}</span>
          </div>



          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-slate-600">Partners</span>
            </div>
            <span className="text-lg font-bold text-purple-600">{stats.partner_allocation_count || 0}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-slate-600">Others</span>
            </div>
            <span className="text-lg font-bold text-slate-600">{stats.other_allocation_count || 0}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PropertyCommissionStats;
