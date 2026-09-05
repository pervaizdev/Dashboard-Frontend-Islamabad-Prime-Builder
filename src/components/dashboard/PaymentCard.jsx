"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  CircleDollarSign,
  CreditCard,
  BadgeDollarSign,
  Users,
  TrendingUp,
  Layers,
  Loader2,
  Building2,
  Receipt,
  Clock,
  Landmark,
  Scale,
  DollarSign,
  CheckCircle2,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { dashboardAPI } from "@/api/dashboard";
import Link from "next/link";

const icons = {
  wallet: Wallet,
  creditCard: CreditCard,
  badgeDollarSign: BadgeDollarSign,
  circleDollarSign: CircleDollarSign,
  users: Users,
  trendingUp: TrendingUp,
  layers: Layers,
  building: Building2,
  receipt: Receipt,
  clock: Clock,
  landmark: Landmark,
  scale: Scale,
  dollarSign: DollarSign,
  checkCircle: CheckCircle2,
  calendarCheck: CalendarCheck,
  calendarClock: CalendarClock,
};

const PaymentCard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      try {
        setLoading(true);
        let data;
        if (user.role === "admin" || user.role === "super-admin") {
          data = await dashboardAPI.getAdminSummary();
        } else {
          data = await dashboardAPI.getUserSummary();
        }
        setSummary(data.summary);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) return null;

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  const displayStats = isAdmin
    ? [
      {
        title: "Total Sell Amount",
        value: `Rs. ${summary.total_collective_amount?.toLocaleString() || 0}`,
        helper: "Total sell amount",
        icon: "trendingUp",
        gradientId: "goldGreenGrad",
      },
      {
        title: "Received Amount",
        value: `Rs. ${summary.total_received_amount?.toLocaleString() || 0}`,
        helper: "Total funds collected",
        icon: "wallet",
        gradientId: "greenGoldGrad",
      },
      {
        title: "Remaining Amount",
        value: `Rs. ${summary.total_remaining_amount?.toLocaleString() || 0}`,
        helper: "Total outstanding balance",
        icon: "badgeDollarSign",
        gradientId: "goldGreenGrad",
      },
      {
        title: "Active Properties",
        value: summary.total_active_properties,
        helper: "Properties currently in system",
        icon: "layers",
        gradientId: "greenGoldGrad",
      },
      {
        title: "View All Properties",
        value: "Go to List →",
        helper: "Manage and view properties",
        icon: "building",
        gradientId: "goldGreenGrad",
        href: "/dashboard/propertylist",
      },
      {
        title: "View All Brokers",
        value: "Go to List →",
        helper: "Manage and view brokers",
        icon: "users",
        gradientId: "greenGoldGrad",
        href: "/dashboard/islamabad-prime-builder-broker-manaegment",
      },
    ]
    : [
      {
        title: "Total Amount",
        value: `Rs. ${summary.total_amount?.toLocaleString() || 0}`,
        helper: "Overall property value",
        icon: "trendingUp",
        gradientId: "goldGreenGrad",
      },
      {
        title: "Amount Paid",
        value: `Rs. ${summary.paid_amount?.toLocaleString() || 0}`,
        helper: "Total amount cleared",
        icon: "wallet",
        gradientId: "greenGoldGrad",
      },
      {
        title: "Remaining Balance",
        value: `Rs. ${summary.remaining_amount?.toLocaleString() || 0}`,
        helper: "Pending payment amount",
        icon: "badgeDollarSign",
        gradientId: "goldGreenGrad",
      },
      {
        title: "Total Properties",
        value: summary.total_properties || 0,
        helper: "Your associated properties",
        icon: "building",
        gradientId: "greenGoldGrad",
      },
      {
        title: "Paid Installments",
        value: `${summary.paid_installments || 0} / ${summary.total_installments || 0}`,
        helper: "Completed / Total count",
        icon: "calendarCheck",
        gradientId: "greenGoldGrad",
      },
      {
        title: "Remaining Installments",
        value: summary.remaining_installments || 0,
        helper: "Payments still due",
        icon: "calendarClock",
        gradientId: "goldGreenGrad",
      },
    ];

  return (
    <>
      {/* SVG Gradient definitions for Green + Gold dual tone icons */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0 h-0 w-0">
        <defs>
          <linearGradient id="goldGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c29e6d" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="greenGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#c29e6d" />
          </linearGradient>
        </defs>
      </svg>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {displayStats.map((item, index) => {
          const Icon = icons[item.icon] || Wallet;

          const cardContent = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border border-primary/10 bg-white w-full min-h-[230px] p-6 flex flex-col justify-between transition-all duration-300 premium-border-glow ${item.href ? "hover:scale-105 hover:cursor-pointer hover:shadow-lg" : ""}`}
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              <div className="flex items-center justify-between gap-5">
                <h3 className="font-serif mt-1.5 text-lg font-semibold">
                  {item.title}
                </h3>

                <div className="flex shrink-0 items-center justify-center p-1">
                  <Icon
                    className="h-8 w-8 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                    style={{ stroke: `url(#${item.gradientId})` }}
                  />
                </div>
              </div>

              <div className="relative">
                <h4 className={`font-body text-xl font-semibold tracking-tight text-neutral-800 ${item.href ? "text-primary group-hover:underline" : ""
                  }`}>
                  {item.value}
                </h4>

                <div className="mt-4 border-t border-primary/5 pt-3">
                  <p className="text-[11px] font-medium text-neutral-400 italic font-body">
                    {item.helper}
                  </p>
                </div>
              </div>
            </motion.div>
          );

          if (item.href) {
            return (
              <Link key={index} href={item.href} className="block">
                {cardContent}
              </Link>
            );
          }

          return <div key={index}>{cardContent}</div>;
        })}
      </div>
    </>
  );
};

export default PaymentCard;