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
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsBrokerCommissionPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    report: [], 
    summary: { total_commission_paid: 0, records_count: 0 },
    totalPages: 1,
    currentPage: 1,
    totalCount: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [brokerList, setBrokerList] = useState([]);

  const [filters, setFilters] = useState({
    broker_id: "",
    startDate: "",
    endDate: ""
  });

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

  const fetchReports = async (page = 1, newLimit = limit) => {
    try {
      setLoading(true);
      const res = await brokersAPI.getFilteredBrokerReports({ ...filters, page, limit: newLimit });
      if (res.success) {
        setData(res);
        setCurrentPage(res.currentPage);
        setLimit(newLimit);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllForExport = async () => {
    try {
      toast.loading("Preparing full data for export...");
      const res = await brokersAPI.getFilteredBrokerReports({ ...filters, limit: 5000, page: 1 });
      toast.dismiss();
      return res.report || [];
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch full data for export");
      return [];
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleBrokerSearchChange = (e) => {
    const val = e.target.value;
    setFilters(prev => ({ ...prev, broker_id: val }));

    if (val.trim()) {
      const matches = brokerList.filter(b => 
        b.name.toLowerCase().includes(val.toLowerCase()) || 
        b.broker_id.toString().includes(val)
      );
      setFilteredBrokers(matches);
    } else {
      setFilteredBrokers(brokerList); // Show all if empty
    }
    setActiveSearch("broker");
  };

  const handleBrokerFocus = () => {
    const val = filters.broker_id;
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
    setActiveSearch(null);
  };

  const clearFilters = () => {
    setFilters({
      broker_id: "",
      startDate: "",
      endDate: ""
    });
    fetchReports(1);
  };

  const exportToExcel = async () => {
    const fullData = await fetchAllForExport();
    if (!fullData.length) return toast.error("No data to export");

    const exportData = fullData.map(record => ({
      "Broker Name": record.broker_name,
      "Broker ID": record.broker_id,
      "Property Number": record.property_number,
      "Total Commission": record.broker_commission,
      "Paid in Period": record.paid_in_range,
      "Total Paid": record.paid_ever,
      "Remaining Balance": record.balance,
      "Latest Payment Date": record.payments.length > 0 ? new Date(record.payments[0].paidDate).toLocaleDateString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Broker Reports");
    XLSX.writeFile(wb, `Broker_Comm_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    const fullData = await fetchAllForExport();
    if (!fullData.length) return toast.error("No data to export");

    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Luxury Header Section ---
    doc.setFillColor(17, 17, 17); // Rich Charcoal
    doc.rect(0, 0, pageWidth, 130, 'F');

    // Accent Line (Gold)
    doc.setFillColor(212, 175, 55); // Metallic Gold
    doc.rect(0, 125, pageWidth, 5, 'F');

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(24);
    doc.setFont("times", "bold");
    doc.text("ISLAMABAD PRIME BUILDER", 40, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text("BROKER COMMISSION DISBURSEMENT REGISTRY", 42, 85);

    // Header Metadata
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`DATE GENERATED: ${new Date().toLocaleString().toUpperCase()}`, pageWidth - 200, 60);
    doc.text(`PERIOD: ${filters.startDate || "INITIAL"} — ${filters.endDate || "PRESENT"}`, pageWidth - 200, 75);

    // --- Elegant Summary Section ---
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.roundedRect(40, 150, pageWidth - 80, 50, 2, 2, 'D');

    doc.setTextColor(17, 17, 17);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("COMMISSION SUMMARY", 60, 168);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`TOTAL TRANSACTIONS: ${data.totalCount}`, 60, 185);

    doc.setTextColor(17, 17, 17);
    doc.setFont("helvetica", "bold");
    const recoveredText = `TOTAL DISBURSED: Rs. ${data.summary.total_commission_paid.toLocaleString()}`;
    const textWidth = doc.getTextWidth(recoveredText);
    doc.text(recoveredText, pageWidth - 60 - textWidth, 185);

    const tableColumn = ["Broker Name", "Property Number", "Total Amount", "Paid Amount", "Balance", "Date"];
    const tableRows = fullData.map(r => [
      r.broker_name.toUpperCase(),
      r.property_number,
      `Rs. ${r.broker_commission.toLocaleString()}`,
      `Rs. ${r.paid_in_range.toLocaleString()}`,
      `Rs. ${r.balance.toLocaleString()}`,
      r.payments.length > 0 ? new Date(r.payments[0].paidDate).toLocaleDateString() : "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 220,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 10, font: "helvetica", textColor: [60, 60, 60] },
      headStyles: { 
        fillColor: [17, 17, 17], 
        textColor: [212, 175, 55],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [212, 175, 55] 
      },
      alternateRowStyles: { fillColor: [252, 251, 248] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [17, 17, 17] },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold', textColor: [17, 17, 17] },
        5: { halign: 'center' }
      },
      margin: { left: 40, right: 40 }
    });

    doc.save(`Broker_Report_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-slate-50/50">
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
            height: isFilterOpen ? "auto" : "80px",
            overflow: isFilterOpen ? "visible" : "hidden" 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
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
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Broker</label>
                      <input
                        name="broker_id"
                        value={filters.broker_id}
                        onChange={handleBrokerSearchChange}
                        onFocus={handleBrokerFocus}
                        placeholder="Type Name or ID..."
                        autoComplete="off"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all underline-none outline-none"
                      />
                      <AnimatePresence>
                        {activeSearch === "broker" && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-[100] top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl p-2 border border-slate-200"
                          >
                              <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white rotate-45 border-l border-t border-slate-200" />
                              <div className="max-h-60 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                                {filteredBrokers.length > 0 ? filteredBrokers.map((b, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => selectBroker(b)}
                                    className="px-5 py-3 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
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
                      <button onClick={() => fetchReports(1)} className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Apply Search</button>
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
          {/* Pagination Controls */}
          <div className="px-10 py-10 border-t border-slate-50 bg-white space-y-8">
            <div className="text-center text-sm font-medium text-slate-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.totalCount)} of {data.totalCount} entries
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 overflow-hidden">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => fetchReports(1, Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {[10, 25, 50, 100].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fetchReports(1)}
                  disabled={currentPage === 1 || loading}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all disabled:opacity-30"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => fetchReports(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {[...Array(data.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === data.totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                      return (
                        <button
                          key={i}
                          onClick={() => fetchReports(pageNum)}
                          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                            currentPage === pageNum 
                              ? "bg-primary text-white shadow-lg shadow-primary/20" 
                              : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                      return <span key={i} className="px-1 text-slate-300">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => fetchReports(currentPage + 1)}
                  disabled={currentPage === data.totalPages || loading}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => fetchReports(data.totalPages)}
                  disabled={currentPage === data.totalPages || loading}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all disabled:opacity-30"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-slate-600">
                  Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{data.totalPages}</span>
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Go to page:</span>
                  <input
                    type="number"
                    min="1"
                    max={data.totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= data.totalPages) {
                        fetchReports(val);
                      }
                    }}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-center text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
