"use client";

import {
  Wallet,
  CircleDollarSign,
  CreditCard,
  BadgeDollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { stats } from "@/data/OverViewData.js";

const icons = {
  wallet: Wallet,
  creditCard: CreditCard,
  badgeDollarSign: BadgeDollarSign,
  circleDollarSign: CircleDollarSign,
};

const PaymentCard = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item, index) => {
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
             
                <h3 className="font-serif text-sm font-bold mt-3 text-charcoal">
                  {item.title}
                </h3>
              

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300`}
              >
                <Icon className={`h-6 w-6 text-primary`} />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-3xl font-bold tracking-tight text-charcoal">
                {item.value}
              </h4>
            </div>

            <div className="mt-2 border-t border-primary/5 pt-3">
              <p className="text-[11px] font-medium text-charcoal/40 italic font-body">
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