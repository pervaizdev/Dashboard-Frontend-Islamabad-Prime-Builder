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
  ChevronDown,
  Layers,
  X,
  Search,
  CheckCircle2,
  Clock3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ properties: [], summary: { total_paid_in_range: 0, properties_count: 0 } });
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await propertyAPI.getFilteredProperties(filters);
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
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
    fetchReports();
  };

  const exportToExcel = () => {
    if (!data.properties.length) return toast.error("No data to export");

    const exportData = data.properties.map(p => ({
      "Property Number": p.property_number,
      "Type": p.type,
      "Building": p.building_name,
      "Floor": p.floor,
      "Category": p.category,
      "Total Price": p.total_price,
      "Overall Paid": p.total_paid_overall,
      "Remaining Balance": p.remaining_amount,
      "Amount Paid in Range": p.total_paid_in_range
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Property Report");
    XLSX.writeFile(wb, `Property_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data.properties.length) return toast.error("No data to export");

    const doc = new jsPDF("l", "pt", "a4");
    
    // Header styling
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("Islamabad Prime Builder", 40, 40);
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text("Property Summary & Collection Report", 40, 65);
    
    doc.setFontSize(9);
    doc.text(`Date Range: ${filters.startDate || "All Time"} to ${filters.endDate || "Present"}`, 40, 90);
    doc.text(`Status: ${filters.status || "All"}`, 40, 105);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 40, 120);

    // Summary highlight boxes
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, 140, 760, 40, 10, 10, 'FD');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Total Records: ${data.summary.properties_count}`, 60, 165);
    doc.text(`Total Collection in Period: Rs. ${data.summary.total_paid_in_range.toLocaleString()}`, 250, 165);

    const tableColumn = ["Prop #", "Type", "Building", "Floor", "Total Price", "Paid Total", "Remaining", "Range Paid"];
    const tableRows = data.properties.map(p => [
      p.property_number,
      p.type,
      p.building_name,
      p.floor,
      `Rs. ${p.total_price.toLocaleString()}`,
      `Rs. ${p.total_paid_overall.toLocaleString()}`,
      `Rs. ${p.remaining_amount.toLocaleString()}`,
      `Rs. ${p.total_paid_in_range.toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 200,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 8 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`Property_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Property Ref #</label>
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

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110">
                <Building2 size={80} />
             </div>
             <div className="relative">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtered Properties</span>
                <h2 className="text-3xl font-bold text-slate-800 mt-2">{data.summary.properties_count} Properties</h2>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                   <div className="h-2 w-2 rounded-full bg-slate-300" />
                   Matching your criteria
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
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property Info</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">T. Price</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Paid (Total)</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Paid (Range)</th>
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
                  data.properties.map((p, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={p.property_id} 
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                           {p.property_number}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{p.type}</span>
                            <span className="text-[10px] font-medium text-slate-400">{p.category}</span>
                         </div>
                      </td>
                      <td className="px-6 py-6 font-medium text-slate-600 text-sm">
                         {p.building_name} • {p.floor}
                      </td>
                      <td className="px-6 py-6 text-center text-sm font-bold text-slate-600">
                         {p.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-6 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-emerald-600">{p.total_paid_overall.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Total</span>
                         </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-blue-600">{p.total_paid_in_range.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">In Period</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <span className={`text-sm font-bold ${p.remaining_amount > 0 ? "text-slate-800" : "text-emerald-500"}`}>
                            {p.remaining_amount > 0 ? p.remaining_amount.toLocaleString() : "Full Paid"}
                         </span>
                      </td>
                    </motion.tr>
                  ))
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
        </div>
      </div>
    </div>
  );
}
