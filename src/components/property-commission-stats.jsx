import React, { useState, useEffect } from 'react';
import {
  Building2, Wallet, PieChart, Receipt, Layers,
  Home, Users, User, ArrowUpRight, ArrowDownRight,
  TrendingUp, CircleDashed, Loader2
} from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import Image from 'next/image';

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
    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-5">
      <div
        className="
      relative overflow-hidden
      min-h-[205px]
      rounded-[24px]
      border border-[#C6A15B]/20
      bg-white
      px-5 py-5
      shadow-[0_8px_24px_rgba(18,61,50,0.06)]
      flex flex-col justify-between
    "
      >


        {/* Header */}
        <div className="relative z-10 flex items-start justify-between">
          <h3 className="text-[15px] mt-2 font-bold leading-[1.35] text-[#123D32]">
            Total Property
            <br />
            Value
          </h3>

          <div className="relative bottom-2">
            <Image
              src="/3D icons/property-value.png"
              alt="Total Property Value"
              width={78}
              height={78}
              className="h-[64px] w-[64px] object-contain"
            />
          </div>
        </div>

        {/* Value */}
        <div className="relative z-10 mt-8">
          <p className="text-[28px] font-bold tracking-[-0.8px] text-[#123D32]">
            Rs. {formatCompactNumber(stats.total_price)}
          </p>

          <p className="mt-1 text-[12px] text-[#8FA1BC]">
            Rs. {formatFullNumber(stats.total_price)}
          </p>
        </div>
      </div>
      <div
        className="
      relative overflow-hidden
      min-h-[205px]
      rounded-[24px]
      border border-[#C6A15B]/20
      bg-white
      px-5 py-5
      shadow-[0_8px_24px_rgba(18,61,50,0.06)]
      flex flex-col justify-between
    "
      >


        <div className="relative z-10 flex items-start justify-between">
          <h3 className="text-[15px] mt-2 font-bold leading-[1.35] text-[#123D32]">
            Received
            <br />
            Amount
          </h3>

          <div className="relative bottom-2">
            <Image
              src="/3D icons/received-amount.png"
              alt="Received Amount"
              width={78}
              height={78}
              className="h-[64px] w-[64px] object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <p className="text-[28px] font-bold tracking-[-0.8px] text-[#123D32]">
            Rs. {formatCompactNumber(stats.total_paid_amount)}
          </p>

          <p className="mt-1 text-[12px] text-[#8FA1BC]">
            Rs. {formatFullNumber(stats.total_paid_amount)}
          </p>
        </div>
      </div>
      <div
        className="
      relative overflow-hidden
      min-h-[205px]
      rounded-[24px]
      border border-[#C6A15B]/20
      bg-white
      px-5 py-5
      shadow-[0_8px_24px_rgba(18,61,50,0.06)]
      flex flex-col justify-between
    "
      >

        <div className="relative z-10 flex items-start justify-between">
          <h3 className="text-[15px] mt-2 font-bold leading-[1.35] text-[#123D32]">
            Remaining
            <br />
            Amount
          </h3>

          <div className="relative bottom-2">
            <Image
              src="/3D icons/remaining-amount.png"
              alt="Remaining Amount"
              width={78}
              height={78}
              className="h-[64px] w-[64px] object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <p className="text-[28px] font-bold tracking-[-0.8px] text-[#123D32]">
            Rs. {formatCompactNumber(stats.total_remaining_amount)}
          </p>

          <p className="mt-1 text-[12px] text-[#8FA1BC]">
            Rs. {formatFullNumber(stats.total_remaining_amount)}
          </p>
        </div>
      </div>
      <div
        className="
      relative overflow-hidden
      min-h-[205px]
      rounded-[24px]
      border border-[#C6A15B]/20
      bg-white
      px-5 py-5
      shadow-[0_8px_24px_rgba(18,61,50,0.06)]
      flex flex-col
    "
      >


        <div className="relative z-10 flex items-start justify-between">
          <h3 className="text-[15px] mt-2 font-bold leading-[1.35] text-[#123D32]">
            Installments
            <br />
            Overview
          </h3>

          <div className="relative bottom-2">
            <Image
              src="/3D icons/installments-overview.png"
              alt="Installments Overview"
              width={78}
              height={78}
              className="h-[64px] w-[64px] object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 mt-6">
          <div className="flex items-center justify-between border-b border-[#123D32]/[0.07] py-2">
            <span className="text-[12px] font-semibold text-[#71829D]">
              Total
            </span>

            <span className="text-[13px] font-bold text-[#123D32]">
              Rs. {formatCompactNumber(stats.total_installment_amount)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#123D32]/[0.07] py-2">
            <span className="text-[12px] font-semibold text-[#71829D]">
              Paid
            </span>

            <span className="text-[13px] font-bold text-[#C6A15B]">
              Rs. {formatCompactNumber(stats.total_paid_installment_amount)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] font-semibold text-[#71829D]">
              Remaining
            </span>

            <span className="text-[13px] font-bold text-[#123D32]">
              Rs. {formatCompactNumber(
                stats.total_remaining_installment_amount
              )}
            </span>
          </div>
        </div>
      </div>
      <div
        className="
      relative overflow-hidden
      min-h-[205px]
      rounded-[24px]
      border border-[#C6A15B]/20
      bg-white
      px-5 py-5
      shadow-[0_8px_24px_rgba(18,61,50,0.06)]
      flex flex-col
    "
      >


        <div className="relative z-10 flex items-start justify-between">
          <h3 className="text-[15px] mt-2 font-bold leading-[1.35] text-[#123D32]">
            Portfolio
            <br />
            Summary
          </h3>

          <div className="relative bottom-2">
            <Image
              src="/3D icons/portfolio-summary.png"
              alt="Portfolio Summary"
              width={78}
              height={78}
              className="h-[64px] w-[64px] object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 mt-5">
          {/* Active Properties */}
          <div className="flex items-center justify-between border-b border-[#123D32]/[0.07] py-2">
            <div className="flex min-w-0 items-center gap-2">
              <Image
                src="/3D icons/active-properties.png"
                alt="Active Properties"
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 object-contain"
              />

              <span className="truncate text-[12px] font-semibold text-[#71829D]">
                Active Properties
              </span>
            </div>

            <span className="ml-2 text-[14px] font-bold text-[#123D32]">
              {stats.total_active_property || 0}
            </span>
          </div>

          {/* Partners */}
          <div className="flex items-center justify-between border-b border-[#123D32]/[0.07] py-2">
            <div className="flex min-w-0 items-center gap-2">
              <Image
                src="/3D icons/partners.png"
                alt="Partners"
                width={24}
                height={24}
                className="h-5 w-5 shrink-0 object-contain"
              />

              <span className="truncate text-[12px] font-semibold text-[#71829D]">
                Partners
              </span>
            </div>

            <span className="ml-2 text-[14px] font-bold text-[#123D32]">
              {stats.partner_allocation_count || 0}
            </span>
          </div>

          {/* Client */}
          <div className="flex items-center justify-between py-2">
            <div className="flex min-w-0 items-center gap-2">
              <Image
                src="/3D icons/client.png"
                alt="Client"
                width={24}
                height={24}
                className="h-5 w-5 shrink-0 object-contain"
              />

              <span className="truncate text-[12px] font-semibold text-[#71829D]">
                Client
              </span>
            </div>

            <span className="ml-2 text-[14px] font-bold text-[#123D32]">
              {stats.other_allocation_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCommissionStats;
