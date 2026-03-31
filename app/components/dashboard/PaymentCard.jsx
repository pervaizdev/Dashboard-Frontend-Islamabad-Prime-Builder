"use client";

import {
  Wallet,
  CircleDollarSign,
  CreditCard,
  BadgeDollarSign,
} from "lucide-react";

import { stats } from "@/app/data/OverViewData.js";

const iconMap = {
  "Total Payment": { icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
  "Paid Amount": { icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50" },
  "Received Amount": { icon: CircleDollarSign, color: "text-amber-500", bg: "bg-amber-50" },
  "Remaining Amount": { icon: BadgeDollarSign, color: "text-rose-500", bg: "bg-rose-50" },
};

const PaymentCard = () => {
  return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {stats.map((item, index) => {
          const iconData =
            iconMap[item.title] || {
              icon: Wallet,
              color: "text-[#c29e6d]",
              bg: "bg-[#c29e6d]/10",
            };

          const Icon = iconData.icon;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 h-[100px]"
            >

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    {item.title}
                  </p>
                  <h4 className="mt-1 text-xl font-bold text-[#08211e]">
                    {item.value}
                  </h4>
                </div>

                <div className={`rounded-xl ${iconData.bg} p-3`}>
                  <Icon className={`h-5 w-5 ${iconData.color}`} />
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-[#c29e6d]/5 blur-2xl" />
            </div>
          );
        })}
      </div>
  );
};

export default PaymentCard;