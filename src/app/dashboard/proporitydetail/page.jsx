"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  BadgeDollarSign,
  CreditCard,
  Building2,
  Layers3,
  Ruler,
  CheckCircle2,
  Clock3,
  Download,
  CircleDollarSign,
  ShieldCheck,
  Landmark,
  ReceiptText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { properties } from "@/data/OverViewData";

const iconMap = {
  wallet: Wallet,
  creditCard: CreditCard,
  badgeDollarSign: BadgeDollarSign,
  circleDollarSign: CircleDollarSign,
};

const PropertyDetailContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const property = properties.find((item) => item.id === Number(id));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (!property) {
    return (
      <div className="min-h-screen section-gradient flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-[2.5rem] p-12 text-center premium-border-glow max-w-lg shadow-2xl"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
             <Landmark size={40} className="text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
            Property Not Found
          </h1>
          <p className="font-body text-charcoal/50 mb-8">
            The requested estate details could not be retrieved from our private portfolio.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 rounded-xl bg-charcoal px-10 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary hover:text-charcoal transition-all shadow-xl shadow-charcoal/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-gradient px-4 py-8 md:px-10 lg:px-16 space-y-10">
      
      {/* Header Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col gap-6 rounded-[2.5rem] glass p-8 premium-border-glow md:flex-row md:items-center md:justify-between shadow-2xl shadow-primary/5"
      >
        <div className="space-y-1">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-charcoal lg:text-5xl">
            {property.shopNo}
          </h1>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-charcoal text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-all shadow-xl shadow-charcoal/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        
        {/* Unit Information */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass rounded-[2.5rem] p-8 premium-border-glow shadow-xl"
        >
          <div className="mb-10 flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal">
                Unit Specifications
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Structural Integrity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { icon: Building2, label: "Unit Identifier", value: property.unitInfo.unitNumber },
              { icon: Layers3, label: "Floor Elevation", value: property.unitInfo.floor },
              { icon: Ruler, label: "Architectural Footprint", value: property.unitInfo.size },
              { icon: ShieldCheck, label: "Classification", value: property.unitInfo.type },
            ].map((item, idx) => (
              <div key={idx} className="group rounded-2xl border border-primary/5 bg-white/40 p-5 transition-all hover:bg-primary/5 hover:border-primary/20">
                <div className="mb-3 flex items-center gap-2 text-primary/40 group-hover:text-primary transition-colors">
                  <item.icon className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em]">
                    {item.label}
                  </p>
                </div>
                <h4 className="font-serif text-lg font-bold text-charcoal group-hover:translate-x-1 transition-transform">
                  {item.value}
                </h4>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment overview */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass rounded-[2.5rem] p-8 premium-border-glow shadow-xl bg-charcoal/5"
        >
          <div className="mb-10 flex items-center gap-5 border-b border-primary/10 pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal text-primary shadow-lg ring-1 ring-primary/20">
              <Landmark className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal group-hover:text-primary">
                Financial Portfolio
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Asset Valuation</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Total Contractual Value", value: property.paymentInfo.total },
              { label: "Invested Capital (Paid)", value: property.paymentInfo.paid },
              { label: "Accountable Balance", value: property.paymentInfo.remainingAmount },
              { label: "Pending Installments", value: property.paymentInfo.remainingInstallment },
              { label: "Initial Commitment", value: property.paymentInfo.downPayment },
              { label: "Collective Net Worth", value: property.paymentInfo.netWorth, highlight: true },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-2xl px-6 py-5 transition-all ${
                  item.highlight ? 'bg-charcoal text-white shadow-xl ring-1 ring-primary/30' : 'bg-white/60 border border-primary/5 hover:bg-primary/5'
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-widest ${item.highlight ? 'text-primary/70' : 'text-charcoal/40'}`}>
                  {item.label}
                </span>
                <span className={`font-serif text-lg font-bold ${item.highlight ? 'text-primary' : 'text-charcoal'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Installment Table */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="rounded-[2.5rem] glass overflow-hidden premium-border-glow shadow-2xl"
      >
        <div className="shimmer-gold px-10 py-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-primary/20 gap-4">
          <div className="flex items-center gap-5">
             <div className="bg-charcoal p-3 rounded-2xl shadow-lg">
                <ReceiptText className="text-primary" size={24} />
             </div>
             <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  Amortization Schedule
                </h3>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-charcoal text-white">
                <th className="px-10 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">
                  Billing Cycle
                </th>
                <th className="px-10 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">
                  Installment Value
                </th>
                <th className="px-10 py-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">
                  Authentication Status
                </th>
                <th className="px-10 py-6 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">
                  Ledger Access
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/5 bg-white">
              {property.installments.map((item, index) => (
                <motion.tr 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition-colors hover:bg-primary/[0.02]"
                >
                  <td className="px-10 py-6 font-serif text-base font-bold text-charcoal">
                    {item.month}
                  </td>
                  <td className="px-10 py-6 font-body text-charcoal/60 font-medium">
                    {item.installment}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span
                      className={`inline-flex items-center gap-3 rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-widest ${
                        item.status === "Paid"
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                          : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                      }`}
                    >
                      {item.status === "Paid" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5" />
                      )}
                      {item.status === "Paid" ? "Secured" : "Awaiting Transaction"}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="group inline-flex items-center gap-3 rounded-xl border border-primary/20 bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal transition-all hover:bg-charcoal hover:text-white hover:border-charcoal hover:shadow-lg shadow-primary/10">
                      <Download className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                      Get Receipt
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

const PropertyDetailPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-charcoal">Loading property details...</div>}>
      <PropertyDetailContent />
    </Suspense>
  );
};

export default PropertyDetailPage;
