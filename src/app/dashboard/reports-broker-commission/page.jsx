"use client";

import { useState, useEffect } from "react";
import { brokersAPI } from "@/api/brokers";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  Search,
  CircleDollarSign,
  Loader2,
  ChevronDown,
  X,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsBrokerCommissionPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ report: [], summary: { total_commission_paid: 0, records_count: 0 } });
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [brokerList, setBrokerList] = useState([]);

  const [filters, setFilters] = useState({
    broker_id: "",
    startDate: "",
    endDate: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(null);
  const [filteredBrokers, setFilteredBrokers] = useState([]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = () => setActiveSearch(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const res = await brokersAPI.getBrokersNames();
        if (res.success) setBrokerList(res.brokers || []);
      } catch (error) {
        console.error("Failed to fetch brokers", error);
      }
    };
    fetchBrokers();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await brokersAPI.getFilteredBrokerReports(filters);
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleBrokerSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (val.trim()) {
      const matches = brokerList.filter(b =>
        b.name.toLowerCase().includes(val.toLowerCase()) ||
        b.broker_id.toString().includes(val)
      );
      setFilteredBrokers(matches);
    } else {
      setFilteredBrokers(brokerList); // Show all if empty
      setFilters(prev => ({ ...prev, broker_id: "" }));
    }
    setActiveSearch("broker");
  };

  const handleBrokerFocus = () => {
    const val = searchTerm;
    if (val) {
      const matches = brokerList.filter(b =>
        b.name.toLowerCase().includes(val.toLowerCase()) ||
        b.broker_id.toString().includes(val)
      );
      setFilteredBrokers(matches);
    } else {
      setFilteredBrokers(brokerList); // Show all on focus
    }
    setActiveSearch("broker");
  };

  const selectBroker = (b) => {
    setFilters(prev => ({ ...prev, broker_id: b.broker_id }));
    setSearchTerm(b.name);
    setActiveSearch(null);
  };

  const clearFilters = () => {
    setFilters({
      broker_id: "",
      startDate: "",
      endDate: ""
    });
    setSearchTerm("");
  };

  const exportToExcel = () => {
    if (!data.report.length) return toast.error("No data to export");

    const exportData = data.report.map(record => ({
      "Broker ID": record.broker_id,
      "Property Number": record.property_number,
      "Total Commission": record.broker_commission,
      "Disbursed in Period": record.paid_in_range,
      "Latest Payment Date": record.payments.length > 0 ? new Date(record.payments[0].paidDate).toLocaleDateString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Broker Reports");
    XLSX.writeFile(wb, `Broker_Comm_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data.report.length) return toast.error("No data to export");

    const doc = new jsPDF("p", "pt", "a4");

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("Islamabad Prime Builder", 40, 40);
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text("Broker Disbursement & Commission Report", 40, 65);

    doc.setFontSize(9);
    doc.text(`Period: ${filters.startDate || "All Time"} to ${filters.endDate || "Present"}`, 40, 95);
    doc.text(`Broker ID: ${filters.broker_id || "All Brokers"}`, 40, 110);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 125);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, 140, 515, 40, 10, 10, 'FD');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Records Count: ${data.summary.records_count}`, 60, 165);
    doc.text(`Total Paid Out in Range: Rs. ${data.summary.total_commission_paid.toLocaleString()}`, 250, 165);

    const tableColumn = ["Prop #", "Broker ID", "Total Comm.", "Paid in Range"];
    const tableRows = data.report.map(r => [
      r.property_number,
      `#${r.broker_id}`,
      `Rs. ${r.broker_commission.toLocaleString()}`,
      `Rs. ${r.paid_in_range.toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 200,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 10 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] }
    });

    doc.save(`Broker_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-slate-50/50">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Broker Reports</h1>
            <p className="mt-2 text-slate-500">Track and audit broker commission disbursements and earnings.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={exportToExcel} className="inline-flex items-center gap-2 bg-emerald-600/10 text-emerald-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600/20 transition-all border border-emerald-600/20">
              <Download className="h-4 w-4" />
              XLSX
            </button>
            <button onClick={exportToPDF} className="inline-flex items-center gap-2 bg-rose-600/10 text-rose-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-rose-600/20 transition-all border border-rose-600/20">
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50"
          initial={false}
          animate={{
            height: isFilterOpen ? "auto" : "80px"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: isFilterOpen ? "visible" : "hidden" }}
        >
          <div onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-10 py-6 border-b border-slate-50 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-800">Filter Commissions</h3>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Broker</label>
                      <div className="relative">
                        <input
                          name="broker_id"
                          value={searchTerm}
                          onChange={handleBrokerSearchChange}
                          onFocus={handleBrokerFocus}
                          placeholder="Type Name or ID..."
                          autoComplete="off"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => {
                              setSearchTerm("");
                              setFilters(prev => ({ ...prev, broker_id: "" }));
                              setActiveSearch(null);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {activeSearch === "broker" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute z-[110] top-full mt-3 left-0 w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-slate-200"
                          >
                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white/80 backdrop-blur-xl rotate-45 border-l border-t border-slate-200" />
                            <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                              {filteredBrokers.length > 0 ? filteredBrokers.map((b, i) => (
                                <div
                                  key={i}
                                  onClick={() => selectBroker(b)}
                                  className="px-5 py-3 hover:bg-white rounded-xl cursor-pointer transition-all hover:shadow-sm"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">{b.name}</span>
                                    <span className="text-[10px] text-slate-400">ID: #{b.broker_id}</span>
                                  </div>
                                </div>
                              )) : (
                                <div className="px-5 py-4 text-slate-400 text-xs text-center italic">No brokers found</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Starting From</label>
                      <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ending At</label>
                      <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button onClick={clearFilters} className="px-8 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all">Clear</button>
                    <button onClick={fetchReports} className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Apply Search</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 p-8 text-primary/10 group-hover:scale-110 transition-transform">
              <TrendingUp size={100} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Disbursements</span>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">Rs. {data.summary.total_commission_paid.toLocaleString()}</h2>
              <p className="text-[10px] font-bold text-emerald-600 mt-4 uppercase tracking-tighter">Paid out in selected period</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 p-8 text-primary/10 group-hover:scale-110 transition-transform">
              <Users size={100} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Transactions</span>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">{data.summary.records_count} Records</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Matching your search criteria</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-slate-800">Disbursement Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Broker Name</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Total Commission</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Paid in Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-10 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : data.report.length > 0 ? (
                  data.report.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                          {r.property_number}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-slate-500">
                        {r.broker_name}
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">
                        Rs. {r.broker_commission.toLocaleString()}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-sm font-bold text-emerald-600">
                          Rs. {r.paid_in_range.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-slate-400 italic">No commission records found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
