"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Calendar, 
  CreditCard,
  Building2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { propertyAPI } from "@/api/property";

const Admin_due_payment = () => {
  const [data, setData] = useState({ properties: [], totalCount: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10
  });

  const fetchDueInstallments = async () => {
    try {
      setLoading(true);
      const res = await propertyAPI.getDueInstallments(filters);
      if (res.success) {
        setData({
          properties: res.properties,
          totalCount: res.totalCount,
          totalPages: res.totalPages
        });
      }
    } catch (error) {
      console.error("Failed to fetch due installments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDueInstallments();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters.page, filters.status, filters.search]);

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
  };


  return (
    <div className="mt-16 lg:mt-24 w-full">
      {/* Header & Controls */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-800 md:text-5xl">
            Due <span className="text-primary italic">Payments</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-400 font-body">Manage and track all pending installment payments.</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search Property #..."
              className="h-11 rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none w-full md:w-64"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />

          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select 
              className="h-11 rounded-xl border border-neutral-200 bg-white pl-10 pr-8 text-sm font-bold uppercase tracking-wider transition-all focus:border-primary outline-none appearance-none cursor-pointer"
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2.5rem] bg-white border border-neutral-100 shadow-2xl shadow-neutral-200/50"
      >
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">Loading Records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-100">
                  <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Property Info</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Period</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Due Date</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                <AnimatePresence mode="popLayout">
                  {data.properties.map((item, index) => (
                    <motion.tr 
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-neutral-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-800">{item.property_number}</p>
                            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{item.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-bold text-neutral-600">
                          <Clock className="h-3.5 w-3.5 text-primary/60" />
                          {item.monthYear}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="font-serif text-base font-bold text-neutral-800">
                          Rs. {item.amount?.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "paid" 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-rose-50 text-rose-600"
                        }`}>
                          {item.status === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <Link 
                          href={`/dashboard/proporitydetail?id=${item.property_id}`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-neutral-900"
                        >
                          Details
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {!loading && data.properties.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="rounded-full bg-neutral-50 p-6 mb-4">
                  <CreditCard className="h-10 w-10 text-neutral-200" />
                </div>
                <h3 className="text-base font-bold text-neutral-800">No Records Found</h3>
                <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-8 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Showing <span className="text-neutral-800">{data.properties.length}</span> of <span className="text-neutral-800">{data.totalCount}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-all hover:border-primary disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-bold uppercase">Page {filters.page} of {data.totalPages || 1}</span>
            <button 
              disabled={filters.page >= data.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-all hover:border-primary disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin_due_payment;

