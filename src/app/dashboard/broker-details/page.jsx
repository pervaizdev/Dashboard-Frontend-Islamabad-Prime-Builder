"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  Loader2,
  User,
  Phone,
  CalendarDays,
  X,
  ReceiptText,
  TrendingUp,
  Layers,
  Building,
  CreditCard,
  History,
  Eye,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { brokersAPI } from "@/api/brokers";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// --- Record Payment Modal ---
const BrokerPaymentModal = ({ isOpen, onClose, onConfirm, property, loading }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDate(new Date().toISOString().split('T')[0]);
      setReceiptImage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    onConfirm({ amount: Number(amount), paidDate: date, receiptImage });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Full Screen Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl premium-border-glow"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto shadow-lg shadow-emerald-600/10">
              <BadgeDollarSign size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-800">Record Commission</h3>
            <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {property?.property_number} • Balance: Rs. {property?.balance?.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">
                Payment Amount
              </label>
              <div className="relative">
                <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  type="number"
                  required
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">
                Payment Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">
                Payment Receipt (Optional)
              </label>
              <div className="relative h-14 w-full group">
                <div className="absolute inset-0 rounded-2xl border border-slate-100 bg-slate-50 flex items-center px-4 transition-all group-hover:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/5">
                  <Download className="text-primary mr-4" size={18} />
                  <span className="text-xs font-bold text-slate-400 truncate pr-4">
                    {receiptImage ? receiptImage.name : "Select Receipt Image"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptImage(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-emerald-600 shadow-xl shadow-slate-900/10 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Confirm Payment
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const BrokerDetailsContent = () => {
  const searchParams = useSearchParams();
  const brokerId = searchParams.get("id");
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const fetchData = async () => {
    if (!brokerId) return;
    try {
      setLoading(true);
      const res = await brokersAPI.getCommissionStats(brokerId);
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [brokerId]);

  const handlePayClick = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (paymentData) => {
    try {
      setProcessing(true);
      
      const formData = new FormData();
      formData.append("amount", paymentData.amount);
      formData.append("paidDate", paymentData.paidDate);
      if (paymentData.receiptImage) {
        formData.append("receiptImage", paymentData.receiptImage);
      }

      const res = await brokersAPI.recordCommissionPayment(
        brokerId,
        selectedProperty.property_number,
        formData,
        "Islamabad_Prime_Builder/BrokerPayment"
      );

      if (res.success) {
        toast.success("Payment recorded successfully!");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Failed to record payment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const stats = data.stats;

  return (
    <div className="h-full px-4 py-10 md:px-10 lg:px-16 bg-slate-50/50 space-y-10">
      {/* Payment Modal */}
      <BrokerPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
        property={selectedProperty}
        loading={processing}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50"
      >
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm text-yellow-600">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Broker Portfolio</h1>
            <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">ID: #{brokerId}</p>
          </div>
        </div>
        <Link
          href="/dashboard/islamabad-prime-builder-broker-manaegment"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
        >
          <ArrowLeft size={16} />
          Back to List
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Commissions",
            value: `Rs. ${stats.total_commission?.toLocaleString()}`,
            helper: "Aggregate commission assigned",
            icon: CircleDollarSign
          },
          {
            label: "Amount Received",
            value: `Rs. ${stats.total_paid?.toLocaleString()}`,
            helper: "Total disbursements received",
            icon: CreditCard
          },
          {
            label: "Pending Balance",
            value: `Rs. ${stats.total_balance?.toLocaleString()}`,
            helper: "Outstanding amount to be paid",
            icon: BadgeDollarSign,
            highlight: true
          },
          {
            label: "Associated Properties",
            value: stats.properties_count || 0,
            helper: "Total properties brokered",
            icon: Building2
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 transition-all duration-300 premium-border-glow ${item.highlight ? 'border-l-4 border-l-yellow-500' : ''}`}
          >
            {/* Hover Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            <div className="flex items-start justify-between">
              <h3 className="font-serif text-lg font-semibold mt-3 text-neutral-700">
                {item.label}
              </h3>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-body text-xl font-semibold tracking-tight text-neutral-800">
                {item.value}
              </h4>
            </div>

            <div className="mt-2 border-t border-primary/5 pt-3">
              <p className="text-[11px] font-medium text-neutral-400 italic font-body">
                {item.helper}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">

        {/* Properties Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <Building2 className="text-primary" size={20} />
            <h3 className="font-serif text-xl font-bold text-slate-800">Associated Properties</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-left">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Building</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Commission</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Paid</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Balance</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                    {user?.role === "super-admin" ? "Action" : "Status"}
                  </th>      </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.properties?.map((prop, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{prop.type} - {prop.property_number}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-600 text-sm">
                      {prop.building_name}
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-600 text-sm">
                      Rs. {prop.commission_amount?.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-emerald-600 text-sm">
                      Rs. {prop.paid_amount?.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-800 text-sm">
                      Rs. {prop.balance?.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {user?.role === "super-admin" ? (
                        // ✅ Super Admin → full control
                        prop.balance > 0 ? (
                          <button
                            onClick={() => handlePayClick(prop)}
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-emerald-600/20"
                          >
                            <BadgeDollarSign size={14} />
                            Record Pay
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle2 size={14} />
                            Cleared
                          </span>
                        )
                      ) : (
                        // ❌ Non-super-admin → only status
                        <span
                          className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${prop.balance > 0
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-emerald-50 text-emerald-600"
                            }`}
                        >
                          {prop.balance > 0 ? "Pending" : "Cleared"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Global Payment History */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <History className="text-primary" size={20} />
              <h3 className="font-serif text-xl font-bold text-slate-800">Payment Disbursement History</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-left">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Property Ref</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Transaction Value</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.properties.flatMap(p => p.payment_history.map(h => ({ ...h, propNum: p.property_number }))).sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate)).length > 0 ? (
                  data.properties.flatMap(p => p.payment_history.map(h => ({ ...h, propNum: p.property_number }))).sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate)).map((pay, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-semibold text-slate-600 text-center">
                        {new Date(pay.paidDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"                                                 
                        })}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                          {pay.propNum}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-emerald-600 text-center">
                        Rs. {pay.amount?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className=" font-bold text-emerald-600 flex items-center justify-center gap-1">
                          <CheckCircle2 size={12} /> Successfully Paid
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {pay.receiptImage ? (
                          <div className="flex items-center justify-center gap-2">
                             <a 
                                href={pay.receiptImage} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all"
                                title="View Receipt"
                              >
                                <Eye size={14} />
                              </a>
                              <a 
                                href={pay.receiptImage.replace('/upload/', '/upload/fl_attachment/')} 
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                                title="Download Receipt"
                              >
                                <Download size={14} />
                              </a>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Receipt</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-slate-400 italic text-sm">No payment history found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function BrokerDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading broker details...</div>}>
      <BrokerDetailsContent />
    </Suspense>
  );
}
