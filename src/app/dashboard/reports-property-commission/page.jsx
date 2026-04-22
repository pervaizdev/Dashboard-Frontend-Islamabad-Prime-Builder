"use client";

import { useState, useEffect } from "react";
import { propertyAPI } from "@/api/property";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Building,
  Building2,
  CircleDollarSign,
  Loader2,
  Search,
  CheckCircle2,
  Clock3,
  ChevronDown,
  Layers,
  X,
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

export default function ReportsPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    properties: [], 
    summary: { total_paid_in_range: 0, properties_count: 0, total_records: 0 },
    totalPages: 1,
    currentPage: 1, 
    totalCount: 0 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [filters, setFilters] = useState({
    property_number: "",
    status: "", // paid, unpaid
    startDate: "",
    endDate: "",
    floor: "",
    category: "",
    building_name: "",
    type: ""
  });

  const [suggestions, setSuggestions] = useState({
    property_number: [],
    building_name: [],
    type: [],
    floor: []
  });

  const [activeSearch, setActiveSearch] = useState(null); // Track which field is active
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await propertyAPI.getAllProperties({ limit: 2000 });
        if (res.success) {
          const props = res.properties || [];
          setSuggestions({
            property_number: [...new Set(props.map(p => p.property_number))].sort(),
            building_name: [...new Set(props.map(p => p.building_name).filter(Boolean))].sort(),
            type: [...new Set(props.map(p => p.type).filter(Boolean))].sort(),
            floor: [...new Set(props.map(p => p.floor).filter(Boolean))].sort()
          });
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };
    fetchOptions();
  }, []);

  const handleSearchChange = (e, field) => {
    const val = e.target.value;
    setFilters(prev => ({ ...prev, [field]: val }));

    const options = suggestions[field] || [];
    if (val.trim()) {
      const matches = options.filter(opt =>
        opt.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredOptions(matches);
    } else {
      setFilteredOptions(options); // Show all if empty
    }
    setActiveSearch(field);
  };

  const handleSearchFocus = (field) => {
    const val = filters[field];
    const options = suggestions[field] || [];
    if (val.trim()) {
      const matches = options.filter(opt =>
        opt.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredOptions(matches);
    } else {
      setFilteredOptions(options); // Show all on focus
    }
    setActiveSearch(field);
  };

  const selectOption = (field, val) => {
    setFilters(prev => ({ ...prev, [field]: val }));
    setActiveSearch(null);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = () => setActiveSearch(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const fetchReports = async (page = 1, newLimit = limit) => {
    try {
      setLoading(true);
      const res = await propertyAPI.getFilteredProperties({ ...filters, page, limit: newLimit });
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
      const res = await propertyAPI.getFilteredProperties({ ...filters, limit: 5000, page: 1 });
      toast.dismiss();
      return res.properties || [];
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch full data for export");
      return [];
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      property_number: "",
      status: "",
      startDate: "",
      endDate: "",
      floor: "",
      category: "",
      building_name: "",
      type: ""
    });
  };

  const handleApplyFilters = () => {
    fetchReports(1); // Reset to page 1 on new search
  };

  const exportToExcel = async () => {
    const fullData = await fetchAllForExport();
    if (!fullData.length) return toast.error("No data to export");

    const exportData = fullData.map(record => {
      const row = {
        "Prop #": record.property_number,
        "Month/Year": record.monthYear,
        "Amount": record.amount,
        "Building": record.building_name,
        "Floor": record.floor,
        "Total Actual Cost": record.total_price,
        "Remaining Price": record.remaining_amount,
        "Status": record.status.toUpperCase()
      };

      if (filters.status !== "unpaid") {
        const date = record.status === "paid" ? record.paidDate : record.dueDate;
        row[record.status === "paid" ? "Paid Date" : "Due Date"] = date ? new Date(date).toLocaleDateString() : "-";
      }

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Property Report");
    XLSX.writeFile(wb, `Property_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    const fullData = await fetchAllForExport();
    if (!fullData.length) return toast.error("No data to export");

    const doc = new jsPDF("l", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Luxury Header Section ---
    doc.setFillColor(17, 17, 17); // Rich Charcoal
    doc.rect(0, 0, pageWidth, 130, 'F');

    // Accent Line (Gold)
    doc.setFillColor(212, 175, 55); // Metallic Gold
    doc.rect(0, 125, pageWidth, 5, 'F');

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(28);
    doc.setFont("times", "bold"); // Serif font for luxury feel
    doc.text("ISLAMABAD PRIME BUILDER", 40, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text("PREMIUM REAL ESTATE COLLECTION REGISTRY", 42, 85);

    // Header Metadata (Cleaned up)
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`DATE GENERATED: ${new Date().toLocaleString().toUpperCase()}`, pageWidth - 250, 60);
    doc.text(`PERIOD: ${filters.startDate || "INITIAL"} — ${filters.endDate || "PRESENT"}`, pageWidth - 250, 75);

    // --- Elegant Summary Section ---
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.roundedRect(40, 150, pageWidth - 80, 50, 2, 2, 'D'); // Thinner, sharper borders for luxury

    doc.setTextColor(17, 17, 17);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("COLLECTION SUMMARY", 60, 168);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`TOTAL PROPERTY UNITS: ${data.summary.properties_count}`, 60, 185);

    doc.setTextColor(17, 17, 17);
    doc.setFont("helvetica", "bold");
    const recoveredText = `TOTAL RECOVERED AMOUNT: Rs. ${data.summary.total_paid_in_range.toLocaleString()}`;
    const textWidth = doc.getTextWidth(recoveredText);
    doc.text(recoveredText, pageWidth - 60 - textWidth, 185);

    // --- Professional Table Preparation ---
    const isUnpaidOnly = filters.status === "unpaid";
    const isPaidOnly = filters.status === "paid";

    // Column Headers
    let tableColumn = ["PROP #", "MONTH", "BUILDING", "FLOOR", "ACTUAL COST"];
    if (!isUnpaidOnly) tableColumn.push("PAID AMOUNT");
    tableColumn.push("REMAINING", "STATUS");

    if (isPaidOnly) tableColumn.push("SETTLEMENT DATE");
    else if (!isUnpaidOnly) tableColumn.push("DATE");

    const tableRows = fullData.map(record => {
      const rowData = [
        record.property_number,
        record.monthYear.toUpperCase(),
        record.building_name.toUpperCase(),
        record.floor.toUpperCase(),
        `Rs. ${record.total_price.toLocaleString()}`
      ];

      if (!isUnpaidOnly) {
        rowData.push(`Rs. ${record.status === "paid" ? record.amount.toLocaleString() : "0"}`);
      }

      rowData.push(
        `Rs. ${record.remaining_amount.toLocaleString()}`,
        record.status.toUpperCase()
      );

      if (isPaidOnly) {
        rowData.push(record.paidDate ? new Date(record.paidDate).toLocaleDateString() : "-");
      } else if (!isUnpaidOnly) {
        const date = record.status === "paid" ? record.paidDate : record.dueDate;
        rowData.push(date ? new Date(date).toLocaleDateString() : "-");
      }

      return rowData;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 220,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 10, font: "helvetica", textColor: [60, 60, 60] },
      headStyles: {
        fillColor: [17, 17, 17],
        textColor: [212, 175, 55],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [212, 175, 55]
      },
      alternateRowStyles: { fillColor: [252, 251, 248] }, // Slight cream tint for luxury
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [17, 17, 17] },
        4: { halign: 'right' },
        ...(isUnpaidOnly ? {
          5: { halign: 'right' },
          6: { halign: 'center' }
        } : {
          5: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] },
          6: { halign: 'right' },
          7: { halign: 'center' }
        })
      },
      margin: { left: 40, right: 40 }
    });

    const fileName = `PB_LUXE_REPORT_${filters.status || "ALL"}_${new Date().getTime()}`;
    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-slate-50/50">
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Property Reports</h1>
            <p className="mt-2 text-slate-500">Generate detailed financial and status reports for properties.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 bg-emerald-600/10 text-emerald-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600/20 transition-all border border-emerald-600/20"
            >
              <Download className="h-4 w-4" />
              Excel Export
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center gap-2 bg-rose-600/10 text-rose-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-rose-600/20 transition-all border border-rose-600/20"
            >
              <FileText className="h-4 w-4" />
              PDF Report
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <motion.div
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50"
          initial={false}
          animate={{
            height: isFilterOpen ? "auto" : "80px",
            overflow: isFilterOpen ? "visible" : "hidden"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-10 py-6 border-b border-slate-50 flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-800">Search Filters</h3>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Property Number</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    name="property_number"
                    value={filters.property_number}
                    onChange={(e) => handleSearchChange(e, "property_number")}
                    onFocus={() => handleSearchFocus("property_number")}
                    placeholder="Search Number..."
                    autoComplete="off"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all underline-none outline-none"
                  />

                  <AnimatePresence>
                    {activeSearch === "property_number" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-[100] top-full mt-2 left-0 w-full bg-white text-black rounded-2xl shadow-2xl p-2 border border-white/5"
                      >
                        <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white text-black rotate-45 border-l border-t border-white/5" />
                        <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                          {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                            <div
                              key={i}
                              onClick={() => selectOption("property_number", opt)}
                              className="px-5 py-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                            >
                              <span className="text-sm font-bold text-black">{opt}</span>
                            </div>
                          )) : (
                            <div className="px-5 py-4 text-slate-500 text-xs text-center italic">No matches found</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Installment Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none outline-none"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid Only</option>
                  <option value="unpaid">Unpaid/Due Only</option>
                </select>
              </div>

              {/* Date Start */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Date End */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Building */}
              <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Building Name</label>
                <input
                  name="building_name"
                  value={filters.building_name}
                  onChange={(e) => handleSearchChange(e, "building_name")}
                  onFocus={() => handleSearchFocus("building_name")}
                  placeholder="e.g. Tower A"
                  autoComplete="off"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                />
                <AnimatePresence>
                  {activeSearch === "building_name" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-[100] top-full mt-2 left-0 w-full bg-white text-black rounded-2xl shadow-2xl p-2 border border-white/5"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white text-black rotate-45 border-l border-t border-white/5" />
                      <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                        {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => selectOption("building_name", opt)}
                            className="px-5 py-3  text-black rounded-xl cursor-pointer transition-colors"
                          >
                            <span className="text-sm font-bold text-black">{opt}</span>
                          </div>
                        )) : (
                          <div className="px-5 py-4 text-slate-500 text-xs text-center italic">No matches found</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Floor */}
              <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Floor Level</label>
                <input
                  name="floor"
                  value={filters.floor}
                  onChange={(e) => handleSearchChange(e, "floor")}
                  onFocus={() => handleSearchFocus("floor")}
                  placeholder="e.g. 5th"
                  autoComplete="off"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                />
                <AnimatePresence>
                  {activeSearch === "floor" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-[100] top-full mt-2 left-0 w-full bg-white text-black rounded-2xl shadow-2xl p-2 border border-white/5"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white text-black rotate-45 border-l border-t border-white/5" />
                      <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                        {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => selectOption("floor", opt)}
                            className="px-5 py-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                          >
                            <span className="text-sm font-bold text-black">{opt}</span>
                          </div>
                        )) : (
                          <div className="px-5 py-4 text-slate-500 text-xs text-center italic">No matches found</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Type */}
              <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Property Type</label>
                <input
                  name="type"
                  value={filters.type}
                  onChange={(e) => handleSearchChange(e, "type")}
                  onFocus={() => handleSearchFocus("type")}
                  placeholder="e.g. Shop, Flat"
                  autoComplete="off"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                />
                <AnimatePresence>
                  {activeSearch === "type" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-[100] top-full mt-2 left-0 w-full bg-white text-black rounded-2xl shadow-2xl p-2 border border-white/5"
                    >
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white text-black rotate-45 border-l border-t border-white/5" />
                      <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                        {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => selectOption("type", opt)}
                            className="px-5 py-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                          >
                            <span className="text-sm font-bold text-black">{opt}</span>
                          </div>
                        )) : (
                          <div className="px-5 py-4 text-slate-500 text-xs text-center italic">No matches found</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category / Size</label>
                <input
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  placeholder="e.g. 2 Bed"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
              <button
                onClick={clearFilters}
                className="px-8 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search Records
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110">
              <Building2 size={80} />
            </div>
            <div className="relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched Records</span>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">{data.totalCount} Results</h2>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <div className="h-2 w-2 rounded-full bg-slate-300" />
                Across {data.summary.properties_count} Properties
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110">
              <CircleDollarSign size={80} />
            </div>
            <div className="relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection in Range</span>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">Rs. {data.summary.total_paid_in_range.toLocaleString()}</h2>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Based on selected date range
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg font-bold text-slate-800">Report Preview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ref #</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Installment</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Date</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Amount</th>
                  <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-10 py-6">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : data.properties.length > 0 ? (
                  <>
                    {data.properties.map((record, idx) => (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={`${record.property_id}-${record.monthYear}-${idx}`}
                        className="hover:bg-slate-50/30 transition-colors group"
                      >
                        <td className="px-10 py-6">
                          <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                            {record.property_number}
                          </span>
                        </td>
                        <td className="px-6 py-6 font-bold text-slate-700 text-sm">
                          {record.monthYear}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${record.status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                            }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center text-sm text-slate-500 font-medium">
                          {record.status === "paid"
                            ? (record.paidDate ? new Date(record.paidDate).toLocaleDateString() : "-")
                            : (record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-")
                          }
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{record.type}</span>
                            <span className="text-[10px] font-medium text-slate-400">{record.building_name} • {record.floor}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">
                          {record.amount.toLocaleString()}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className={`text-sm font-bold ${record.remaining_amount > 0 ? "text-slate-800" : "text-emerald-500"}`}>
                            {record.remaining_amount.toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={7} className="px-10 py-28 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <X className="h-12 w-12 opacity-20" />
                        <p className="text-sm font-medium">No property records matching these filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-10 py-10 border-t border-slate-50 bg-white space-y-8">
            {/* Showing entries text */}
            <div className="text-center text-sm font-medium text-slate-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.totalCount)} of {data.totalCount} entries
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 overflow-hidden">
              {/* Limit Select */}
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

              {/* Navigation Buttons */}
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
                    // Show current page and 2 neighbors
                    if (
                      pageNum === 1 ||
                      pageNum === data.totalPages ||
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
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

              {/* Info & Jump */}
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
