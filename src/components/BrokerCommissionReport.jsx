"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users,
  Building2,
  FileText,
  CircleDollarSign,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Loader2,
  Wallet,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  PieChart as PieChartIcon,
  BarChart3,
  Landmark,
  User,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Pagination from "@/components/pagination";
import { dashboardAPI } from "@/api/dashboard";
import toast from "react-hot-toast";

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatShortNumber = (num) => {
  if (num === undefined || num === null || isNaN(num) || num === 0) return "0";
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "B";
  }
  if (abs >= 1_000_000) {
    const val = num / 1_000_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "M";
  }
  if (abs >= 1_000) {
    const val = num / 1_000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K";
  }
  return num.toString();
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="min-w-[220px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg text-xs space-y-1.5 z-50">
      <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}:
          </span>
          <span className="font-bold text-slate-900">
            Rs. {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function BrokerCommissionReport() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [expandedBrokerId, setExpandedBrokerId] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("All Buildings");
  const [buildingsList, setBuildingsList] = useState([]);
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);

  const [activeFilterParams, setActiveFilterParams] = useState("");
  const buildingRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buildingRef.current && !buildingRef.current.contains(event.target)) {
        setIsBuildingOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (selectedBuilding && selectedBuilding !== "All Buildings") {
      params.append("building_name", selectedBuilding);
    }
    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }
    return params.toString();
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setActiveFilterParams(buildQueryString());
    setIsBuildingOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedBuilding("All Buildings");
    setCurrentPage(1);
    setActiveFilterParams("");
    setIsBuildingOpen(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);

        const reportQuery = `page=${currentPage}&limit=${limit}${activeFilterParams ? `&${activeFilterParams}` : ""}`;

        const [reportsRes, statsRes] = await Promise.all([
          dashboardAPI.getBrokerCommissionReports(reportQuery),
          dashboardAPI.getBrokerCommissionStats(activeFilterParams),
        ]);

        if (reportsRes.success) {
          setBrokers(reportsRes.brokers || []);
          if (reportsRes.buildings) setBuildingsList(reportsRes.buildings);
          if (reportsRes.pagination) {
            setTotalPages(reportsRes.pagination.totalPages || 1);
            setTotalRecords(reportsRes.pagination.totalRecords || 0);
          }
        }

        if (statsRes.success) {
          setStats(statsRes.stats);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch broker commission report data");
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    loadData();
  }, [currentPage, limit, activeFilterParams]);

  const toggleBroker = (brokerId) => {
    setExpandedBrokerId((prev) => (prev === brokerId ? null : brokerId));
  };

  const donutData = useMemo(() => {
    if (stats?.donutData && Array.isArray(stats.donutData)) {
      return stats.donutData;
    }
    const paid = stats?.paidCommission || 0;
    const unpaid = stats?.unpaidCommission || 0;
    return [
      { name: "Paid Commission", value: paid, color: "#10b981" },
      { name: "Unpaid Commission", value: unpaid, color: "#f59e0b" },
    ];
  }, [stats]);

  const totalPieAmount = useMemo(
    () => donutData.reduce((acc, curr) => acc + (curr.value || 0), 0),
    [donutData]
  );

  const barData = useMemo(() => {
    if (stats?.monthlyData && Array.isArray(stats.monthlyData)) {
      return stats.monthlyData;
    }
    return [];
  }, [stats]);

  return (
    <div className="space-y-8">

      {/* ── SECTION 1: FILTER CARD ── */}
      <div className="overflow-visible rounded-[26px] border border-[#123D32]/10 bg-white shadow-[0_12px_35px_rgba(18,61,50,0.08)] mt-8">
        <div className="relative overflow-visible rounded-t-[26px] bg-[#123D32] px-6 py-6 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#E5C476] sm:text-[30px]">
            Broker Commission Reports
          </h1>
        </div>

        <div className="px-5 py-6 sm:px-8">
          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">

            {/* Search Input */}
            <div>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  placeholder="Search broker name or property number..."
                  className="h-[47px] w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 pr-9 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 placeholder:font-medium placeholder:text-[#123D32]/35 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-xs font-bold text-[#C6A15B] transition-colors hover:text-[#123D32]"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Building Dropdown */}
            <div className="relative" ref={buildingRef}>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
                Building
              </label>

              <button
                type="button"
                onClick={() => setIsBuildingOpen((prev) => !prev)}
                className="flex h-[47px] w-full cursor-pointer items-center justify-between rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 text-xs font-bold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
              >
                <span className="truncate">{selectedBuilding}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#A7B2AE] transition-transform duration-200 ${isBuildingOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>

              {isBuildingOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 space-y-1 overflow-y-auto rounded-xl border border-[#C6A15B]/20 bg-white p-1.5 shadow-[0_15px_35px_rgba(18,61,50,0.15)]">
                  <div
                    onClick={() => {
                      setSelectedBuilding("All Buildings");
                      setIsBuildingOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${selectedBuilding === "All Buildings"
                      ? "bg-[#123D32] text-[#E1BE73]"
                      : "text-[#123D32]/75 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                      }`}
                  >
                    All Buildings
                  </div>

                  {buildingsList.map((b, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedBuilding(b);
                        setIsBuildingOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${selectedBuilding === b
                        ? "bg-[#123D32] text-[#E1BE73]"
                        : "text-[#123D32]/75 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                        }`}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4 border-t border-[#123D32]/10 pt-5 sm:justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-[42px] w-full sm:w-auto cursor-pointer rounded-xl border border-[#123D32]/25 bg-white px-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#123D32]/75 transition-all duration-200 hover:border-[#C6A15B]/45 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
            >
              Clear All
            </button>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="h-[42px] w-full sm:w-auto cursor-pointer rounded-xl bg-[#123D32] px-7 text-[10px] font-bold uppercase tracking-[0.1em] text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>





      {/* ── SECTION 3: CHARTS ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Donut Chart: Paid vs Unpaid Commission */}
        <div
          className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm lg:col-span-4 relative [&_*]:outline-none"
          onMouseLeave={() => setHoveredSlice(null)}
        >
          <h2 className="mb-3 text-sm sm:text-base font-bold text-slate-800">Broker Commission By Status</h2>

          <div className="flex items-center gap-4 sm:gap-6 py-1 lg:ms-4 ms-1 lg:mt-14 mt-0">
            {/* Donut Pie */}
            <div className="relative shrink-0 flex items-center justify-center" style={{ width: 150, height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    style={{ outline: "none" }}
                  >
                    {donutData.map((e) => (
                      <Cell
                        key={e.name}
                        fill={e.color}
                        stroke="none"
                        style={{ outline: "none" }}
                        className="cursor-pointer transition-opacity duration-200 focus:outline-none focus-visible:outline-none"
                        opacity={hoveredSlice && hoveredSlice.name !== e.name ? 0.4 : 1}
                        onMouseEnter={() => setHoveredSlice(e)}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                <span className="text-[12px] font-extrabold leading-snug text-slate-800">
                  Rs. {formatShortNumber(totalPieAmount)}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full sm:flex-1 space-y-2 sm:space-y-3 min-w-0">
              {donutData.map((item) => {
                const isActive = hoveredSlice?.name === item.name;
                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredSlice(item)}
                    className={`flex items-center gap-2 cursor-pointer rounded-xl p-2 transition-all ${isActive ? "bg-slate-50 ring-1 ring-slate-200/80 shadow-xs" : "hover:bg-slate-50/60"
                      }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-semibold text-slate-500">
                        {item.name}
                      </div>
                      <div className="truncate text-[12px] font-bold text-slate-900 mt-0.5">
                        Rs. {formatCurrency(item.value)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bar Chart: Monthly Commission Performance */}
        <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm lg:col-span-8 [&_*]:outline-none">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-800">Collections Over Time</h2>
            <span className="text-xs font-semibold text-slate-400">
              {isMobile ? "Last 4 Months" : "Last 12 Months"}
            </span>
          </div>

          <div className="h-48 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={isMobile ? barData.slice(-4) : barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barGap={isMobile ? 4 : 2}
                barCategoryGap={isMobile ? "25%" : "20%"}
                style={{ outline: "none" }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: isMobile ? 10 : 9, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  tickFormatter={formatShortNumber}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="paid" name="Paid Commission" fill="#10b981" stroke="none" radius={[3, 3, 0, 0]} barSize={8} style={{ outline: "none" }} />
                <Bar dataKey="unpaid" name="Unpaid Commission" fill="#f59e0b" stroke="none" radius={[3, 3, 0, 0]} barSize={8} style={{ outline: "none" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
              <span className="text-xs font-semibold text-slate-600">Paid Commission</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-xs font-semibold text-slate-600">Unpaid Commission</span>
            </div>
          </div>
        </div>

      </div>


      {/* ── SECTION 4: BROKER COMMISSION TABLE ── */}
      <div className="rounded-2xl border border-[#C6A15B]/30 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#1F6B4F]/20">
            <thead className="bg-[#123D32]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Broker Name</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Total Properties</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Total Sales Amount</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Total Commission</th>

              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-[#1F6B4F]/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#123D32]/60">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#C6A15B]" />
                    <p className="mt-2 text-xs font-semibold text-[#123D32]">Loading broker commission reports...</p>
                  </td>
                </tr>
              ) : brokers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#123D32]/60">
                    <div className="text-sm font-semibold text-[#123D32]">No broker commission records found</div>
                    <p className="mt-1 text-xs text-[#123D32]/60">Try adjusting your search criteria or building filter.</p>
                  </td>
                </tr>
              ) : (
                brokers.map((broker) => {
                  const isExpanded = expandedBrokerId === broker.broker_id;
                  return (
                    <React.Fragment key={broker.broker_id}>
                      <tr
                        onClick={() => toggleBroker(broker.broker_id)}
                        className="cursor-pointer transition-colors hover:bg-[#C6A15B]/5"
                      >
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-[#123D32]">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown size={16} className="shrink-0 text-[#C6A15B]" />
                            ) : (
                              <ChevronRight size={16} className="shrink-0 text-[#123D32]/40" />
                            )}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C6A15B]/10 text-[#123D32] border border-[#C6A15B]/30">
                              <User size={17} />
                            </div>
                            <span className="font-bold text-[#123D32]">{broker.broker_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-center text-sm font-semibold text-[#123D32]">
                          {broker.total_properties}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-bold text-[#123D32]">
                          Rs. {formatCurrency(broker.total_sales)}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-center text-sm font-bold text-[#C6A15B]">
                          {broker.commission_percentage}%
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-bold text-[#123D32]">
                          Rs. {formatCurrency(broker.total_commission)}
                        </td>

                      </tr>

                      {/* Expanded Property Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-[#F8FAF9]">
                          <td colSpan={5} className="px-6 py-4 border-l-4 border-l-[#C6A15B]">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#123D32]">
                                Property Commission Breakdown
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                      <th className="px-4 py-2 font-bold">Property No</th>
                                      <th className="px-4 py-2 font-bold">Building</th>
                                      <th className="px-4 py-2 font-bold">Type / Floor</th>
                                      <th className="px-4 py-2 font-bold text-right">Property Sales Worth</th>
                                      <th className="px-4 py-2 font-bold text-right">Broker Commission</th>
                                      <th className="px-4 py-2 font-bold text-right">Unpaid Amount</th>
                                      <th className="px-4 py-2 font-bold text-right">Paid Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {(broker.properties_breakdown || []).map((prop, pIdx) => (
                                      <tr key={pIdx} className="hover:bg-slate-50">
                                        <td className="px-4 py-2.5 font-bold text-[#123D32]">{prop.property_number}</td>
                                        <td className="px-4 py-2.5 font-semibold text-slate-700">{prop.building_name}</td>
                                        <td className="px-4 py-2.5 text-slate-500">{prop.type} ({prop.floor || "N/A"})</td>
                                        <td className="px-4 py-2.5 font-bold text-slate-800 text-right">Rs. {formatCurrency(prop.total_price)}</td>
                                        <td className="px-4 py-2.5 font-bold text-[#123D32] text-right">Rs. {formatCurrency(prop.broker_commission)}</td>
                                        <td className="px-4 py-2.5 font-bold text-amber-600 text-right">Rs. {formatCurrency(prop.unpaid_commission)}</td>
                                        <td className="px-4 py-2.5 font-bold text-emerald-600 text-right">Rs. {formatCurrency(prop.paid_commission)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setCurrentPage(1);
          }}
        />
      </div>

    </div>
  );
}
