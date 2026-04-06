"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  CircleDollarSign,
  CreditCard,
  BadgeDollarSign,
  Users,
  Percent,
  Layers,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { dashboardAPI } from "@/api/dashboard";

const icons = {
  wallet: Wallet,
  creditCard: CreditCard,
  badgeDollarSign: BadgeDollarSign,
  circleDollarSign: CircleDollarSign,
  users: Users,
  percent: Percent,
  layers: Layers,
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
          icon: "percent",
        },
          {
          title: "Received Amount",
          value: `Rs. ${summary.total_received_amount?.toLocaleString() || 0}`,
          helper: "Total funds collected",
          icon: "creditCard",
        },
          {
          title: "Remaining Amount",
          value: `Rs. ${summary.total_remaining_amount?.toLocaleString() || 0}`,
          helper: "Total outstanding balance",
          icon: "badgeDollarSign",
        },
        {
          title: "Active Properties",
          value: summary.total_active_properties,
          helper: "Properties currently in system",
          icon: "layers",
        },
        
      
   
      ]
    : [
        {
          title: "Total Amount",
          value: `Rs. ${summary.total_amount?.toLocaleString() || 0}`,
          helper: "Overall property value",
          icon: "wallet",
        },
         {
          title: "Amount Paid",
          value: `Rs. ${summary.paid_amount?.toLocaleString() || 0}`,
          helper: "Total amount cleared",
          icon: "creditCard",
        },
         {
          title: "Remaining Balance",
          value: `Rs. ${summary.remaining_amount?.toLocaleString() || 0}`,
          helper: "Pending payment amount",
          icon: "badgeDollarSign",
        },
        {
          title: "Total Properties",
          value: summary.total_properties || 0,
          helper: "Your associated properties",
          icon: "layers",
        },
      
           
        {
          title: "Paid Installments",
          value: `${summary.paid_installments || 0} / ${summary.total_installments || 0}`,
          helper: "Completed / Total count",
          icon: "circleDollarSign",
        },
        {
          title: "Remaining Installments",
          value: summary.remaining_installments || 0,
          helper: "Payments still due",
          icon: "circleDollarSign",
        },
      ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {displayStats.map((item, index) => {
        const Icon = icons[item.icon] || Wallet;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 transition-all duration-300 premium-border-glow"
          >
            {/* Hover Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-sm font-bold mt-3 text-neutral-700">
                {item.title}
              </h3>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300`}
              >
                <Icon className={`h-6 w-6 text-primary`} />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-2xl font-bold tracking-tight text-neutral-800">
                {item.value}
              </h4>
            </div>

            <div className="mt-2 border-t border-primary/5 pt-3">
              <p className="text-[11px] font-medium text-neutral-400 italic font-body">
                {item.helper}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PaymentCard;