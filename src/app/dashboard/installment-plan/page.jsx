"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  Building2,
  Clock3,
  Loader2,
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

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Robust YYYY-MM key extractor — reads directly from the ISO string to avoid
 * any UTC↔local timezone shift that can push e.g. Jul 01 00:00:00 UTC into
 * Jun 30 in a UTC+5 browser.
 */
const getYearMonthKey = (dueDateStr, monthYearStr) => {
  // 1. Prefer reading the first 7 chars of an ISO date string  "2026-07-..."
  if (dueDateStr && typeof dueDateStr === "string") {
    const match = dueDateStr.match(/^(\d{4})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;
  }

  // 2. Fall back to the "Jul 26" / "Jul-2026" monthYear label
  if (monthYearStr && typeof monthYearStr === "string") {
    const MAP = {
      jan: "01", feb: "02", mar: "03", apr: "04",
      may: "05", jun: "06", jul: "07", aug: "08",
      sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const parts = monthYearStr.toLowerCase().split(/[\s\-\/]+/);
    let m = null, y = null;
    parts.forEach((p) => {
      if (MAP[p]) m = MAP[p];
      else if (/^\d{4}$/.test(p)) y = p;
      else if (/^\d{2}$/.test(p)) y = `20${p}`;
    });
    if (m && y) return `${y}-${m}`;
  }

  // 3. Last resort — parse via UTC
  if (dueDateStr) {
    const d = new Date(dueDateStr);
    if (!isNaN(d.getTime()))
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  return null;
};

/**
 * Format a YYYY-MM key as "Jul-2026"
 */
const keyToLabel = (key) => {
  const [year, month] = key.split("-");
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  // Short label: "Sep-25" (2-digit year so all 12 fit horizontally)
  const shortYear = year.slice(-2);
  return `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}-${shortYear}`;
};

/**
 * Format a YYYY-MM key as the short period label shown in the Period column.
 * Monthly:   "Jul 26"
 * Quarterly: "Jul 26 - Sep 26"
 */
const formatPeriodLabel = (monthYearStr, paymentPlan) => {
  if (!monthYearStr || monthYearStr === "-") return "-";

  // Parse the raw "Jul 26" / "Jul-26" / "Jul 2026" string into year+month
  const MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3,
    may: 4, jun: 5, jul: 6, aug: 7,
    sep: 8, oct: 9, nov: 10, dec: 11,
  };

  const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const parts = monthYearStr.toLowerCase().split(/[\s\-\/]+/);
  let mIdx = null, year = null;

  // Handle "Jul 26 - Sep 26" (quarterly stored as range)
  if (monthYearStr.includes(" - ") || monthYearStr.includes("-")) {
    const segments = monthYearStr.split(/\s*-\s*/);
    if (segments.length >= 2) {
      const startParts = segments[0].trim().toLowerCase().split(/\s+/);
      const endParts = segments[segments.length - 1].trim().toLowerCase().split(/\s+/);

      const sM = startParts.find((p) => MAP[p] !== undefined);
      const sY = startParts.find((p) => /^\d{2,4}$/.test(p));
      const eM = endParts.find((p) => MAP[p] !== undefined);
      const eY = endParts.find((p) => /^\d{2,4}$/.test(p));

      if (sM && sY && eM && eY) {
        const startYear = sY.length === 2 ? `20${sY}` : sY;
        const endYear = eY.length === 2 ? `20${eY}` : eY;
        return `${MONTH_SHORT[MAP[sM]]} ${startYear.slice(-2)} - ${MONTH_SHORT[MAP[eM]]} ${endYear.slice(-2)}`;
      }
    }
  }

  parts.forEach((p) => {
    if (MAP[p] !== undefined) mIdx = MAP[p];
    else if (/^\d{4}$/.test(p)) year = p;
    else if (/^\d{2}$/.test(p)) year = `20${p}`;
  });

  if (mIdx === null || year === null) return monthYearStr;

  const shortYear = year.slice(-2);

  if (paymentPlan === "quarterly") {
    const endMIdx = (mIdx + 2) % 12;
    const endYearNum = mIdx + 2 >= 12 ? Number(year) + 1 : Number(year);
    return `${MONTH_SHORT[mIdx]} ${shortYear} - ${MONTH_SHORT[endMIdx]} ${String(endYearNum).slice(-2)}`;
  }

  return `${MONTH_SHORT[mIdx]} ${shortYear}`;
};

/* -------------------------------------------------------------------------- */
/*                            Custom Bar Chart Tooltip                        */
/* -------------------------------------------------------------------------- */

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="min-w-[230px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg text-xs space-y-1.5">
      <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">{label}</p>
      {payload.map((entry, i) => {
        const raw = entry.payload?.[`${entry.dataKey}_raw`] ?? entry.value * 1_000_000;
        return (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-900">Rs. {formatCurrency(raw)}</span>
          </div>
        );
      })}
    </div>
  );
};

const InstallmentPlanPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState(null);   // for donut hover

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Nested Table Toggles
  const [expandedOwners, setExpandedOwners] = useState({});
  const [expandedProperties, setExpandedProperties] = useState({});

  const toggleOwner = (ownerName) => {
    setExpandedOwners((prev) => ({ ...prev, [ownerName]: !prev[ownerName] }));
  };

  const toggleProperty = (propertyId) => {
    setExpandedProperties((prev) => ({ ...prev, [propertyId]: !prev[propertyId] }));
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("All Buildings");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [buildingsList, setBuildingsList] = useState([]);
  const [floorsList, setFloorsList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [activeFilterParams, setActiveFilterParams] = useState("");
  const [initialBuildingSet, setInitialBuildingSet] = useState(false);

  // Debounced Suggestions Fetch
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await dashboardAPI.getPropertyCommissionSuggestions(searchType, searchTerm);
        if (res.success) {
          setSuggestions(res.suggestions || []);
        }
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchType]);

  /* ---- API fetch ---- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = `page=${currentPage}&limit=${limit}${activeFilterParams ? `&${activeFilterParams}` : ""}`;
        const [rep] = await Promise.all([
          dashboardAPI.getPropertyCommissionReports(q),
          dashboardAPI.getPropertyCommissionStats(activeFilterParams),
        ]);
        if (rep.success) {
          setProperties(rep.properties || []);
          if (rep.buildings) setBuildingsList(rep.buildings);
          if (rep.floors) setFloorsList(rep.floors);
          if (rep.types) setTypesList(rep.types);
          if (rep.categories) setCategoriesList(rep.categories);
          if (rep.pagination) {
            setTotalPages(rep.pagination.totalPages || 1);
            setTotalRecords(rep.pagination.totalRecords || 0);
          }
        }
      } catch (e) {
        toast.error(e.message || "Failed to fetch installment plan data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, limit, activeFilterParams]);

  useEffect(() => {
    // Auto-select first building on initial load
    if (buildingsList.length > 0 && !initialBuildingSet) {
      setInitialBuildingSet(true);
      setSelectedBuilding(buildingsList[0]);
      const p = new URLSearchParams(activeFilterParams);
      p.set("building_name", buildingsList[0]);
      setActiveFilterParams(p.toString());
    }
  }, [buildingsList, initialBuildingSet, activeFilterParams]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    const p = new URLSearchParams();
    if (selectedBuilding !== "All Buildings") p.append("building_name", selectedBuilding);
    if (selectedFloor !== "All Floors") p.append("floor", selectedFloor);
    if (selectedType !== "All Types") p.append("type", selectedType);
    if (selectedCategory !== "All Categories") p.append("category", selectedCategory);
    if (startDate) p.append("startDate", startDate);
    if (endDate) p.append("endDate", endDate);
    if (searchTerm.trim()) p.append("search", searchTerm.trim());
    setActiveFilterParams(p.toString());
  };

  const handleClearFilters = () => {
    setSearchTerm(""); setSelectedFloor("All Floors");
    setSelectedType("All Types"); setSelectedCategory("All Categories"); setSelectedStatus("All Status");
    setStartDate(""); setEndDate("");

    // Set building to the first one available
    if (buildingsList.length > 0) {
      setSelectedBuilding(buildingsList[0]);
      const p = new URLSearchParams();
      p.append("building_name", buildingsList[0]);
      setActiveFilterParams(p.toString());
    } else {
      setSelectedBuilding("All Buildings");
      setActiveFilterParams("");
    }

    setExpandedRowId(null); setCurrentPage(1);
  };

  /* ---- Donut data ---- */
  const donutData = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    let dp = 0, paid = 0, unpaid = 0, overdue = 0;
    properties.forEach((prop) => {
      dp += Number(prop.paid_downpayment || prop.down_payment || 0);
      (prop.installments || []).forEach((inst) => {
        const amt = Number(inst.amount) || 0;
        const key = getYearMonthKey(inst.dueDate, inst.monthYear);
        if (inst.status?.toLowerCase() === "paid") paid += amt;
        else if (key && key < curKey) overdue += amt;
        else unpaid += amt;
      });
    });
    return [
      { name: "Down Payment", value: dp, color: "#c29e6d" },
      { name: "Paid Installment", value: paid, color: "#10b981" },
      { name: "Unpaid Installment", value: unpaid, color: "#f59e0b" },
      { name: "Overdue Installment", value: overdue, color: "#ef4444" },
    ];
  }, [properties]);

  const totalPieAmount = useMemo(
    () => donutData.reduce((a, c) => a + c.value, 0),
    [donutData],
  );

  /* ---- Bar data — use installment dueDate month, NOT createdAt ---- */
  const barData = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    // Build ordered 12-month skeleton
    const keys = [];
    const map = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const k = `${y}-${m}`;
      keys.push(k);
      map[k] = { month: keyToLabel(k), downpayment: 0, paid: 0, unpaid: 0, overdue: 0 };
    }

    properties.forEach((prop) => {
      // Down payment goes into the month of the FIRST installment due date
      const firstInst = prop.installments?.[0];
      const dpKey = getYearMonthKey(firstInst?.dueDate, firstInst?.monthYear);
      const dpVal = Number(prop.paid_downpayment || prop.down_payment || 0);
      if (dpVal > 0 && dpKey && map[dpKey]) map[dpKey].downpayment += dpVal;

      (prop.installments || []).forEach((inst) => {
        const amt = Number(inst.amount) || 0;
        const k = getYearMonthKey(inst.dueDate, inst.monthYear);
        if (!k || !map[k]) return;
        if (inst.status?.toLowerCase() === "paid") map[k].paid += amt;
        else if (k < curKey) map[k].overdue += amt;
        else map[k].unpaid += amt;
      });
    });

    // Convert raw amounts to M, keep _raw for tooltip
    return keys.map((k) => {
      const it = map[k];
      return {
        month: it.month,
        downpayment: +(it.downpayment / 1_000_000).toFixed(2),
        downpayment_raw: it.downpayment,
        paid: +(it.paid / 1_000_000).toFixed(2),
        paid_raw: it.paid,
        unpaid: +(it.unpaid / 1_000_000).toFixed(2),
        unpaid_raw: it.unpaid,
        overdue: +(it.overdue / 1_000_000).toFixed(2),
        overdue_raw: it.overdue,
      };
    });
  }, [properties]);

  /* ---- Per-row installment details ---- */
  const getPropertyMainDetails = (property) => {
    const now = new Date();
    const curKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    const installments = property.installments || [];

    // Breakdown: current-month installments (paid + unpaid) + all overdue from past months
    const breakdownInstallments = installments.filter((inst) => {
      const k = getYearMonthKey(inst.dueDate, inst.monthYear);
      if (!k) return false;
      const isPaid = inst.status?.toLowerCase() === "paid";
      // Current month: include both paid and unpaid
      if (k === curKey) return true;
      // Past months: only overdue (unpaid)
      if (k < curKey && !isPaid) return true;
      return false;
    });

    let overdueAmt = 0, currentMonthAmt = 0;
    let hasOverdue = false, hasCurrentUnpaid = false, hasCurrentPaid = false;
    let latestMonthYear = "-";

    installments.forEach((inst) => {
      const isPaid = inst.status?.toLowerCase() === "paid";
      const k = getYearMonthKey(inst.dueDate, inst.monthYear);
      const amt = Number(inst.amount) || 0;

      let isOverdueInst = false;
      if (inst.dueDate) {
        const due = new Date(inst.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        isOverdueInst = !isPaid && due.getTime() < today.getTime();
      } else {
        isOverdueInst = !isPaid && k && k < curKey;
      }

      if (isOverdueInst) {
        hasOverdue = true;
        overdueAmt += amt;
      } else if (k === curKey) {
        currentMonthAmt += amt;
        if (isPaid) hasCurrentPaid = true;
        else hasCurrentUnpaid = true;
      }
    });

    // Priority: Overdue > current-month Unpaid > current-month Paid
    let displayStatus, displayAmount, periodLabel;

    if (hasOverdue) {
      displayStatus = "Overdue";
      displayAmount = overdueAmt;
      // Find the earliest overdue installment for the period label
      const overdueInst = installments.find((inst) => {
        const isPaid = inst.status?.toLowerCase() === "paid";
        if (isPaid) return false;
        if (inst.dueDate) {
          const due = new Date(inst.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          due.setHours(0, 0, 0, 0);
          return due.getTime() < today.getTime();
        }
        const k = getYearMonthKey(inst.dueDate, inst.monthYear);
        return k && k < curKey;
      });
      periodLabel = overdueInst?.monthYear
        ? formatPeriodLabel(overdueInst.monthYear, property.payment_plan)
        : "-";
    } else if (hasCurrentUnpaid) {
      displayStatus = "Unpaid";
      displayAmount = currentMonthAmt;
      const curInst = installments.find((inst) => {
        const k = getYearMonthKey(inst.dueDate, inst.monthYear);
        return k === curKey;
      });
      periodLabel = curInst?.monthYear
        ? formatPeriodLabel(curInst.monthYear, property.payment_plan)
        : "-";
    } else {
      displayStatus = "Paid";
      displayAmount = currentMonthAmt;
      const curInst = installments.find((inst) => {
        const k = getYearMonthKey(inst.dueDate, inst.monthYear);
        return k === curKey;
      });
      periodLabel = curInst?.monthYear
        ? formatPeriodLabel(curInst.monthYear, property.payment_plan)
        : "-";
    }

    const perInstallmentAmount = installments[0]?.amount || 0;

    return { displayStatus, displayAmount, perInstallmentAmount, periodLabel, latestMonthYear, breakdownInstallments };
  };

  /* ---- Filter, Flatten, and Group table ---- */
  const groupedTableData = useMemo(() => {
    const now = new Date();
    const curKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const groups = {};

    properties.forEach((prop) => {
      const ownerNames =
        prop.owners?.length > 0
          ? prop.owners.map((o) => o.name).join(", ")
          : "No Owner";

      const installments = prop.installments || [];
      if (installments.length === 0) return;

      installments.forEach((inst) => {
        const k = getYearMonthKey(inst.dueDate, inst.monthYear);
        if (!k) return;
        const isPaid = inst.status?.toLowerCase() === "paid";

        let isOverdueInst = false;
        if (inst.dueDate) {
          const due = new Date(inst.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          due.setHours(0, 0, 0, 0);
          isOverdueInst = !isPaid && due.getTime() < today.getTime();
        } else {
          isOverdueInst = !isPaid && k && k < curKey;
        }

        // Show if it's Overdue, OR if it's in the current month
        if (isOverdueInst || k === curKey) {
          let displayStatus = "";
          if (isPaid) displayStatus = "Paid";
          else if (isOverdueInst) displayStatus = "Overdue";
          else displayStatus = "Unpaid";

          // Apply selectedStatus filter
          if (selectedStatus !== "All Status" && displayStatus.toLowerCase() !== selectedStatus.toLowerCase()) {
            return;
          }

          if (!groups[ownerNames]) {
            groups[ownerNames] = {
              ownerNames,
              totalAmount: 0,
              propertyCount: 0,
              installmentCount: 0,
              properties: {}
            };
          }

          if (!groups[ownerNames].properties[prop.property_id]) {
            groups[ownerNames].properties[prop.property_id] = {
              property: prop,
              totalAmount: 0,
              installmentCount: 0,
              statusSet: new Set(),
              installments: []
            };
            groups[ownerNames].propertyCount += 1;
          }

          const amt = Number(inst.amount) || 0;

          groups[ownerNames].totalAmount += amt;
          groups[ownerNames].installmentCount += 1;

          const pGroup = groups[ownerNames].properties[prop.property_id];
          pGroup.totalAmount += amt;
          pGroup.installmentCount += 1;
          pGroup.statusSet.add(displayStatus);

          pGroup.installments.push({
            installment: inst,
            displayStatus,
            displayAmount: amt,
            periodLabel: inst.monthYear ? formatPeriodLabel(inst.monthYear, prop.payment_plan) : "-",
            rowKey: `${prop.property_id}-${inst._id || Math.random()}`
          });
        }
      });
    });

    return Object.values(groups);
  }, [properties, selectedStatus]);

  /* ========== RENDER ========== */
  return (
    <div className="min-h-screen space-y-6 bg-slate-50/50 p-4 sm:p-6 lg:p-8">

      {/* ── Filters ── */}
      <div className="rounded-2xl border border-[#ead8b9] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#123f35]">Installment Module</h1>
          <p className="mt-1 text-sm font-medium text-[#78938c]">Manage and track all installment plans in one place.</p>
        </div>
        <div className="my-5 h-px bg-[#efe3cf]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label htmlFor="installment-search" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Search</label>
            <div className="relative flex items-center shadow-sm rounded-xl">
              <select
                value={searchType}
                onChange={(e) => { setSearchType(e.target.value); setSearchTerm(""); setSuggestions([]); }}
                className="h-11 rounded-l-xl border border-r-0 border-[#e8d4b2] bg-[#fcfbf9] px-2 text-xs font-medium text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15">
                <option value="name">Name</option>
                <option value="propertyNumber">Prop. No.</option>
              </select>
              <div className="relative w-full">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#95aaa4]" />
                <input
                  id="installment-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  placeholder={searchType === 'name' ? 'Search owner name...' : 'Search property no...'}
                  className="h-11 w-full rounded-r-xl border border-[#e8d4b2] bg-[#fcfbf9] pl-9 pr-3 text-sm font-medium text-[#244f45] outline-none transition placeholder:text-[#9bada8] focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15"
                />
              </div>
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 top-[105%] z-10 w-full max-h-48 overflow-y-auto rounded-xl border border-[#e8d4b2] bg-white py-1 shadow-lg">
                  {suggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      onMouseDown={() => {
                        setSearchTerm(sug);
                        setShowSuggestions(false);
                        // Trigger fetch automatically on selection
                        setTimeout(() => handleApplyFilters(), 0);
                      }}
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-[#244f45] hover:bg-[#f7f3ec]">
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Building */}
          <div>
            <label htmlFor="building-filter" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Building</label>
            <select id="building-filter" value={selectedBuilding} onChange={(e) => { setSelectedBuilding(e.target.value); setSelectedFloor("All Floors"); }}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15">
              <option value="All Buildings">All Buildings</option>
              {buildingsList.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          {/* Floor */}
          <div>
            <label htmlFor="floor-filter" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Floor Type</label>
            <select id="floor-filter" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)} disabled={selectedBuilding === "All Buildings"}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15 disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="All Floors">All Floors</option>
              {floorsList.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {/* Type */}
          <div>
            <label htmlFor="type-filter" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Type</label>
            <select id="type-filter" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15">
              <option value="All Types">All Types</option>
              {typesList.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Category */}
          <div>
            <label htmlFor="category-filter" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Category</label>
            <select id="category-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15">
              <option value="All Categories">All Categories</option>
              {categoriesList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Status */}
          <div>
            <label htmlFor="status-filter" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Status</label>
            <select id="status-filter" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15">
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          {/* Start Date */}
          <div>
            <label htmlFor="start-date" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15"
            />
          </div>
          {/* End Date */}
          <div>
            <label htmlFor="end-date" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15"
            />
          </div>
        </div>
        <div className="mt-5 flex flex-col justify-end gap-2 sm:flex-row">
          <button type="button" onClick={handleClearFilters}
            className="h-10 rounded-xl bg-[#f7f3ec] px-5 text-sm font-semibold text-[#365f55] transition-colors hover:bg-[#efe8dc]">
            Clear All
          </button>
          <button type="button" onClick={handleApplyFilters}
            className="h-10 rounded-xl bg-[#cda65d] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#b99148]">
            Apply Filters
          </button>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ── Donut chart ── */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-4 relative">
          <h2 className="mb-3 text-base font-bold text-slate-800">Installment Plans by Status</h2>

          {/* Floating Tooltip on Hover */}
          {hoveredSlice && (
            <div className="absolute z-50 top-14 right-5 bg-white text-slate-800 rounded-2xl p-3.5 shadow-xl text-[12px] w-[230px] pointer-events-none transition-all duration-200 border border-slate-200/80">
              <p className="font-bold border-b border-slate-100 pb-1.5 mb-2 text-slate-800 text-center">{hoveredSlice.name}</p>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-800">Rs. {formatCurrency(hoveredSlice.value)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Percentage:</span>
                  <span className="font-bold text-blue-600">
                    {totalPieAmount > 0 ? ((hoveredSlice.value / totalPieAmount) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Row: [donut] [legend] — enlarged donut & balanced spacing */}
          <div className="flex items-center gap-5 sm:gap-6 py-1">

            {/* Donut — enlarged size */}
            <div className="relative shrink-0 focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none" style={{ width: 170, height: 170 }}>
              <ResponsiveContainer width="100%" height="100%" tabIndex={-1}>
                <PieChart tabIndex={-1} style={{ outline: 'none' }}>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={(_, idx) => setHoveredSlice(donutData[idx])}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {donutData.map((e) => (
                      <Cell
                        key={e.name}
                        fill={e.color}
                        opacity={hoveredSlice && hoveredSlice.name !== e.name ? 0.4 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center total — always visible */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[13px] font-extrabold leading-snug text-slate-800">
                  Rs. {(totalPieAmount / 1_000_000).toFixed(2)}M
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend — shifted right with balanced vertical spacing */}
            <div className="flex-1 space-y-2">
              {donutData.map((item) => {
                const isActive = hoveredSlice?.name === item.name;
                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredSlice(item)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center gap-2.5 cursor-default rounded-xl px-2 py-1.5 transition-colors ${isActive ? "bg-slate-50 ring-1 ring-slate-100 shadow-sm" : "hover:bg-slate-50/60"
                      }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="overflow-hidden">
                      {/* Category name */}
                      <div className="whitespace-nowrap text-[11px] font-semibold leading-tight text-slate-500">
                        {item.name}
                      </div>
                      {/* Amount */}
                      <div className="whitespace-nowrap text-[12px] font-bold leading-tight text-slate-900 mt-0.5">
                        {isActive
                          ? `Rs. ${formatCurrency(item.value)}`
                          : `Rs. ${(item.value / 1_000_000).toFixed(2)}M`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bar chart ── */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Collections Over Time</h2>
            <span className="text-xs font-semibold text-slate-400">Last 12 Months</span>
          </div>

          {/* Compact height so card stays proportional */}
          <div className="h-52 w-full focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none">
            <ResponsiveContainer width="100%" height="100%" tabIndex={-1}>
              <BarChart
                tabIndex={-1}
                style={{ outline: 'none' }}
                data={barData}
                barGap={1}
                barCategoryGap="20%"
                margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                {/* Horizontal labels — angle=0, textAnchor=middle, interval=0 */}
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={0}
                  textAnchor="middle"
                  height={22}
                />

                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  unit="M"
                  width={36}
                />

                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />

                <Bar dataKey="downpayment" name="Down Payment" fill="#c29e6d" radius={[3, 3, 0, 0]} barSize={6} />
                <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[3, 3, 0, 0]} barSize={6} />
                <Bar dataKey="unpaid" name="Unpaid" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={6} />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "Down Payment", color: "#c29e6d" },
              { label: "Paid", color: "#10b981" },
              { label: "Unpaid", color: "#f59e0b" },
              { label: "Overdue", color: "#ef4444" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-[#ead8b9] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-[#eee5d8] bg-[#fbf8f3]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">Owner Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">Property Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">Period</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eeeae4] bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#c29e6d]" />
                    <p className="mt-2 text-sm font-semibold text-slate-600">Loading installment plans...</p>
                  </td>
                </tr>
              ) : groupedTableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="text-sm font-semibold text-slate-600">No installment plans found</div>
                    <p className="mt-1 text-xs text-slate-400">Try clearing or adjusting your search or filter options.</p>
                  </td>
                </tr>
              ) : (
                groupedTableData.map((ownerGroup, oIdx) => {
                  const isOwnerExpanded = expandedOwners[ownerGroup.ownerNames];
                  return (
                    <React.Fragment key={ownerGroup.ownerNames + oIdx}>
                      {/* LEVEL 1: Owner Name Row */}
                      <tr
                        className="cursor-pointer transition-colors hover:bg-slate-50 border-b border-slate-100"
                        onClick={() => toggleOwner(ownerGroup.ownerNames)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isOwnerExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7f1e8] text-[#c29e6d]">
                              <User size={17} />
                            </div>
                            <span className="text-sm font-bold text-slate-800">{ownerGroup.ownerNames}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-500">{ownerGroup.propertyCount} Properties</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-500">{ownerGroup.installmentCount} Installments</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">Rs. {formatCurrency(ownerGroup.totalAmount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-400">—</span>
                        </td>
                      </tr>

                      {/* LEVEL 2 & 3 */}
                      {isOwnerExpanded && Object.values(ownerGroup.properties).map((propGroup, pIdx) => {
                        const property = propGroup.property;
                        const isPropertyExpanded = expandedProperties[property.property_id];

                        // Compute aggregate status for property group
                        let aggStatus = "Paid";
                        if (propGroup.statusSet.has("Overdue")) aggStatus = "Overdue";
                        else if (propGroup.statusSet.has("Unpaid")) aggStatus = "Unpaid";

                        return (
                          <React.Fragment key={property.property_id + pIdx}>
                            {/* LEVEL 2: Property Info Row */}
                            <tr
                              className="cursor-pointer transition-all hover:bg-slate-100 border-b border-slate-200 bg-slate-50/80"
                              onClick={() => toggleProperty(property.property_id)}
                            >
                              <td colSpan={2} className="py-3.5 pl-[3.5rem] border-l-4 border-l-[#c29e6d]/40">
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors shadow-sm ${isPropertyExpanded ? 'bg-[#c29e6d] text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                    {isPropertyExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-slate-800">
                                      <span className="text-[#c29e6d]">#{property.property_number}</span> — {property.building_name}
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                      {property.floor || "N/A"} • {property.type}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="text-xs font-semibold text-slate-500">{propGroup.installmentCount} Installments</span>
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="text-sm font-bold text-slate-800">Rs. {formatCurrency(propGroup.totalAmount)}</span>
                              </td>
                              <td className="px-6 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] tracking-wider font-bold uppercase ${aggStatus === "Overdue" ? "bg-rose-100 text-rose-700"
                                    : aggStatus === "Unpaid" ? "bg-orange-100 text-orange-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}>
                                  {aggStatus}
                                </span>
                              </td>
                            </tr>

                            {/* LEVEL 3: Installment Rows */}
                            {isPropertyExpanded && propGroup.installments.map((instRow, iIdx) => (
                              <tr key={instRow.rowKey} className="transition-all hover:bg-slate-50 border-b border-slate-100 bg-white relative group">
                                <td colSpan={2} className="py-3 pl-[5.5rem] border-l-4 border-l-transparent relative">
                                  {/* Tree Connector Lines */}
                                  <div className="absolute left-[4.25rem] top-0 bottom-0 w-[2px] bg-slate-200 group-last:bottom-1/2"></div>
                                  <div className="absolute left-[4.25rem] top-1/2 h-[2px] w-3 bg-slate-200"></div>

                                  <span className="text-sm font-bold text-slate-600">{instRow.periodLabel}</span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-xs font-semibold text-slate-300">—</span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-sm font-bold text-slate-700">Rs. {formatCurrency(instRow.displayAmount)}</span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${instRow.displayStatus === "Overdue" ? "bg-rose-50 text-rose-600"
                                      : instRow.displayStatus === "Unpaid" ? "bg-orange-50 text-orange-500"
                                        : "bg-emerald-50 text-emerald-600"
                                    }`}>
                                    <Clock3 size={11} />
                                    {instRow.displayStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(n) => { setLimit(n); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
};

export default InstallmentPlanPage;