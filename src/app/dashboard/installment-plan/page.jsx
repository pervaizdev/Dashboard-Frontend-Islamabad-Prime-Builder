"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  Building2,
  Clock3,
  Loader2,
  Calendar,
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
import Image from "next/image";


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

const checkIsOverdue = (inst, k, curKey) => {
  if (inst.status?.toLowerCase() === "paid") return false;
  if (inst.dueDate) {
    const due = new Date(inst.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }
  return Boolean(k && k < curKey);
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
  const [selectedAllocation, setSelectedAllocation] = useState("Other");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const searchRef = useRef(null);
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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [buildingsList, setBuildingsList] = useState([]);
  const [floorsList, setFloorsList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [activeFilterParams, setActiveFilterParams] = useState("allocationType=Other");
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
      if (!p.has("allocationType")) p.set("allocationType", "Other");
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
    if (selectedAllocation !== "All Allocations" && selectedAllocation) p.append("allocationType", selectedAllocation);

    if (searchTerm.trim()) p.append("search", searchTerm.trim());
    setActiveFilterParams(p.toString());
  };

  const handleClearFilters = () => {
    setSearchTerm(""); setSelectedFloor("All Floors");
    setSelectedType("All Types"); setSelectedCategory("All Categories"); setSelectedAllocation("Other"); setSelectedStatus("All Status");


    // Set building to the first one available
    if (buildingsList.length > 0) {
      setSelectedBuilding(buildingsList[0]);
      const p = new URLSearchParams();
      p.append("building_name", buildingsList[0]);
      p.append("allocationType", "Other");
      setActiveFilterParams(p.toString());
    } else {
      setSelectedBuilding("All Buildings");
      setActiveFilterParams("allocationType=Other");
    }

    setExpandedOwners({}); setExpandedProperties({}); setCurrentPage(1);
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
        else if (checkIsOverdue(inst, key, curKey)) overdue += amt;
        else unpaid += amt;
      });
    });
    return [
      { name: "Down Payment", value: dp, color: "#C6A15B" },
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
        else if (checkIsOverdue(inst, k, curKey)) map[k].overdue += amt;
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

        let isOverdueInst = checkIsOverdue(inst, k, curKey);

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
              overdueAmount: 0,
              unpaidAmount: 0,
              paidAmount: 0,
              propertyCount: 0,
              installmentCount: 0,
              properties: {}
            };
          }

          if (!groups[ownerNames].properties[prop.property_id]) {
            groups[ownerNames].properties[prop.property_id] = {
              property: prop,
              totalAmount: 0,
              overdueAmount: 0,
              unpaidAmount: 0,
              paidAmount: 0,
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

          if (displayStatus === "Overdue") {
            groups[ownerNames].overdueAmount += amt;
            pGroup.overdueAmount += amt;
          } else if (displayStatus === "Unpaid") {
            groups[ownerNames].unpaidAmount += amt;
            pGroup.unpaidAmount += amt;
          } else if (displayStatus === "Paid") {
            groups[ownerNames].paidAmount += amt;
            pGroup.paidAmount += amt;
          }

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

  const CustomDropdown = ({
    label,
    value,
    displayValue,
    options = [],
    onChange,
    disabled = false,
    placeholder = "Select",
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        {label && (
          <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
            {label}
          </label>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
            }
          }}
          className={`
          flex
          h-[47px]
          w-full
          items-center
          justify-between
          rounded-xl
          border
          px-4
          text-left
          text-xs
          font-bold
          outline-none
          transition-all
          duration-200

          ${isOpen
              ? "border-[#C6A15B] bg-white ring-4 ring-[#C6A15B]/10"
              : "border-[#123D32]/10 bg-[#F8FAF9] hover:border-[#C6A15B]/50 hover:bg-white"
            }

          ${disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
            }
        `}
        >
          <span className="truncate text-[#123D32]">
            {displayValue || value || placeholder}
          </span>

          <ChevronDown
            size={18}
            className={`
            shrink-0
            text-[#123D32]/40
            transition-transform
            duration-200
            ${isOpen ? "rotate-180" : "rotate-0"}
          `}
          />
        </button>

        {isOpen && !disabled && (
          <div
            className="
            absolute
            left-0
            right-0
            top-full
            z-[100]
            mt-2
            max-h-[260px]
            overflow-y-auto
            rounded-[18px]
            border
            border-[#C6A15B]/20
            bg-white
            p-2
            shadow-[0_15px_35px_rgba(18,61,50,0.15)]
          "
          >
            {options.map((option) => {
              const isSelected =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                  flex
                  w-full
                  items-center
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  transition-all
                  duration-150

                  ${isSelected
                      ? "bg-[#123D32] text-[#E5C476]"
                      : "text-[#123D32]/70 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                    }
                `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ========== RENDER ========== */
  return (
    <div className="space-y-8">

      {/* ── Filters ── */}
      <div className="overflow-visible rounded-[26px] border border-[#123D32]/10 bg-white shadow-[0_12px_35px_rgba(18,61,50,0.08)] mt-8">
        {/* Header */}
        <div className="relative overflow-visible rounded-t-[26px] bg-[#123D32] px-6 py-6 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#E5C476] sm:text-[30px]">
            Installment Module
          </h1>
        </div>

        {/* Body */}
        <div className="px-5 py-6 sm:px-8">

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4 items-end">

            {/* Search */}
            <div className="relative" ref={searchRef}>
              <label
                htmlFor="installment-search"
                className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65"
              >
                Search
              </label>

              <div className="relative">
                <input
                  id="installment-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleApplyFilters()
                  }
                  placeholder="Search owner or property..."
                  className="h-[47px] w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 pr-9 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 placeholder:font-medium placeholder:text-[#123D32]/35 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSuggestions([]);
                    }}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-xs font-bold text-[#C6A15B] transition-colors hover:text-[#123D32]"
                  >
                    ×
                  </button>
                )}

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[#C6A15B]/20 bg-white p-1.5 shadow-[0_15px_35px_rgba(18,61,50,0.15)]">
                    {suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchTerm(sug);
                          setShowSuggestions(false);
                          setTimeout(() => handleApplyFilters(), 0);
                        }}
                        className="cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold text-[#123D32] transition-colors hover:bg-[#C6A15B]/10"
                      >
                        <span className="truncate">{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Building */}
            <CustomDropdown
              label="Building"
              value={selectedBuilding}
              options={[
                {
                  value: "All Buildings",
                  label: "All Buildings",
                },
                ...buildingsList.map((b) => ({
                  value: b,
                  label: b,
                })),
              ]}
              onChange={(value) => {
                setSelectedBuilding(value);
                setSelectedFloor("All Floors");
              }}
            />

            {/* Allocation Type */}
            <CustomDropdown
              label="Allocation Type"
              value={selectedAllocation}
              displayValue={
                selectedAllocation === "Other"
                  ? "Client"
                  : selectedAllocation
              }
              options={[
                {
                  value: "All Allocations",
                  label: "All Allocations",
                },
                {
                  value: "Partner",
                  label: "Partner",
                },
                {
                  value: "Other",
                  label: "Client",
                },
              ]}
              onChange={(value) => {
                setSelectedAllocation(value);
              }}
            />

            {/* Floor */}
            <CustomDropdown
              label="Floor Type"
              value={selectedFloor}
              disabled={selectedBuilding === "All Buildings"}
              options={[
                {
                  value: "All Floors",
                  label: "All Floors",
                },
                ...floorsList.map((f) => ({
                  value: f,
                  label: f,
                })),
              ]}
              onChange={(value) => {
                setSelectedFloor(value);
              }}
            />

            {/* Type */}
            <CustomDropdown
              label="Type"
              value={selectedType}
              options={[
                {
                  value: "All Types",
                  label: "All Types",
                },
                ...typesList.map((t) => ({
                  value: t,
                  label: t,
                })),
              ]}
              onChange={(value) => {
                setSelectedType(value);
              }}
            />

            {/* Category */}
            <CustomDropdown
              label="Category"
              value={selectedCategory}
              options={[
                {
                  value: "All Categories",
                  label: "All Categories",
                },
                ...categoriesList.map((c) => ({
                  value: c,
                  label: c,
                })),
              ]}
              onChange={(value) => {
                setSelectedCategory(value);
              }}
            />

            {/* Status */}
            <CustomDropdown
              label="Status"
              value={selectedStatus}
              options={[
                {
                  value: "All Status",
                  label: "All Status",
                },
                {
                  value: "Unpaid",
                  label: "Unpaid",
                },
                {
                  value: "Overdue",
                  label: "Overdue",
                },
              ]}
              onChange={(value) => {
                setSelectedStatus(value);
              }}
            />


          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-center gap-4 border-t border-[#123D32]/10 pt-5 sm:justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-[42px] cursor-pointer rounded-xl border border-[#123D32]/25 bg-white px-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#123D32]/75 transition-all duration-200 hover:border-[#C6A15B]/45 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
            >
              Clear All
            </button>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="h-[42px] cursor-pointer rounded-xl bg-[#123D32] px-7 text-[10px] font-bold uppercase tracking-[0.1em] text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ── Donut chart ── */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-4 relative">
          <h2 className="mb-3 text-base font-bold text-slate-800">Installment Plans by Status</h2>

          {/* Floating Tooltip on Hover / Tap */}
          {hoveredSlice && (
            <div className="absolute z-50 top-14 right-2 sm:right-5 bg-white text-slate-800 rounded-2xl p-3.5 shadow-xl text-[12px] w-[255px] max-w-[calc(100%-1rem)] pointer-events-none transition-all duration-200 border border-slate-200/80">
              <p className="font-bold border-b border-slate-100 pb-1.5 mb-2 text-slate-800 text-center">
                Installment Plans Status
              </p>
              <div className="space-y-2">
                {donutData.map((item) => {
                  const percentage =
                    totalPieAmount > 0
                      ? ((item.value / totalPieAmount) * 100).toFixed(1)
                      : "0.0";
                  const isCurrent = hoveredSlice?.name === item.name;

                  return (
                    <div
                      key={item.name}
                      className={`p-2 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-slate-50 border-slate-300/80 shadow-sm"
                          : "bg-white border-transparent opacity-75"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </span>
                        <span className="text-[11px] font-bold text-blue-600">
                          {percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 text-[11px] pl-4">
                        <span>Amount:</span>
                        <span className="font-bold text-slate-800">
                          Rs. {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row: [donut] [legend] — enlarged donut & balanced spacing */}
          <div className="flex items-center gap-4 sm:gap-6 py-1">

            {/* Donut — enlarged size */}
            <div className="relative shrink-0 focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none" style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%" tabIndex={-1}>
                <PieChart tabIndex={-1} style={{ outline: 'none' }}>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={70}
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
                        className="cursor-pointer transition-opacity duration-200"
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
            <div className="flex-1 space-y-2 min-w-0">
              {donutData.map((item) => {
                const isActive = hoveredSlice?.name === item.name;
                const compactVal = item.value >= 1_000_000_000
                  ? `${(item.value / 1_000_000_000).toFixed(2)}B`
                  : item.value >= 1_000_000
                    ? `${(item.value / 1_000_000).toFixed(2)}M`
                    : item.value >= 1_000
                      ? `${(item.value / 1_000).toFixed(2)}K`
                      : item.value.toFixed(2);

                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-2 cursor-default rounded-xl px-1 py-1.5 transition-colors ${isActive ? "bg-slate-50 ring-1 ring-slate-100 shadow-sm" : "hover:bg-slate-50/60"
                      }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      {/* Category name */}
                      <div className="truncate text-[11px] font-semibold leading-tight text-slate-500">
                        {item.name}
                      </div>
                      {/* Amount: Compact (M/B) */}
                      <div className="truncate text-[12px] font-bold leading-tight text-slate-900 mt-0.5">
                        Rs. {compactVal}
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
            <span className="text-xs font-semibold text-slate-400">
              {isMobile ? "Last 4 Months" : "Last 12 Months"}
            </span>
          </div>

          {/* Compact height so card stays proportional */}
          <div className="h-52 w-full focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none">
            <ResponsiveContainer width="100%" height="100%" tabIndex={-1}>
              <BarChart
                tabIndex={-1}
                style={{ outline: 'none' }}
                data={isMobile ? barData.slice(-4) : barData}
                barGap={isMobile ? 4 : 1}
                barCategoryGap={isMobile ? "25%" : "20%"}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                {/* Horizontal labels — angle=0, textAnchor=middle, interval=0 */}
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: isMobile ? 10 : 9, fill: "#94a3b8" }}
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
                  width={38}
                />

                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />

                <Bar dataKey="downpayment" name="Down Payment" fill="#C6A15B" radius={[3, 3, 0, 0]} barSize={isMobile ? 10 : 6} />
                <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[3, 3, 0, 0]} barSize={isMobile ? 10 : 6} />
                <Bar dataKey="unpaid" name="Unpaid" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={isMobile ? 10 : 6} />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={isMobile ? 10 : 6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {[
              { label: "Down Payment", color: "#C6A15B" },
              { label: "Paid", color: "#10b981" },
              { label: "Unpaid", color: "#f59e0b" },
              { label: "Overdue", color: "#ef4444" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-[#C6A15B]/30 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#1F6B4F]/20">
            <thead className="bg-[#123D32]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Owner Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Property Info</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Period</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#E5C476] uppercase tracking-wider">Status</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-[#1F6B4F]/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-[#123D32]/60">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#C6A15B]" />
                    <p className="mt-2 text-sm font-semibold text-[#123D32]">Loading installment plans...</p>
                  </td>
                </tr>
              ) : groupedTableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-[#123D32]/60">
                    <div className="text-sm font-semibold text-[#123D32]">No installment plans found</div>
                    <p className="mt-1 text-xs text-[#123D32]/60">Try clearing or adjusting your search or filter options.</p>
                  </td>
                </tr>
              ) : (
                groupedTableData.map((ownerGroup, oIdx) => {
                  const isOwnerExpanded = expandedOwners[ownerGroup.ownerNames];
                  return (
                    <React.Fragment key={ownerGroup.ownerNames + oIdx}>
                      {/* LEVEL 1: Owner Name Row */}
                      <tr
                        className="cursor-pointer transition-colors hover:bg-[#C6A15B]/5 border-b border-[#1F6B4F]/10"
                        onClick={() => toggleOwner(ownerGroup.ownerNames)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isOwnerExpanded ? <ChevronDown size={16} className="text-[#C6A15B]" /> : <ChevronRight size={16} className="text-[#123D32]/40" />}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C6A15B]/10 text-[#123D32] border border-[#C6A15B]/30">
                              <User size={17} />
                            </div>
                            <span className="text-sm font-bold text-[#123D32]">{ownerGroup.ownerNames}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-[#123D32]/70">{ownerGroup.propertyCount} Properties</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-[#123D32]/70">{ownerGroup.installmentCount} Installments</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-[#123D32]">Rs. {formatCurrency(ownerGroup.totalAmount)}</div>
                          {(ownerGroup.overdueAmount > 0 || ownerGroup.unpaidAmount > 0) && (
                            <div className="mt-1 flex flex-col gap-0.5 text-[11px]">
                              {ownerGroup.overdueAmount > 0 && (
                                <span className="font-medium text-[#ef4444]">
                                  Overdue: Rs. {formatCurrency(ownerGroup.overdueAmount)}{" "}
                                  ({((ownerGroup.overdueAmount / ownerGroup.totalAmount) * 100).toFixed(1)}%)
                                </span>
                              )}
                              {ownerGroup.unpaidAmount > 0 && (
                                <span className="font-medium text-[#f59e0b]">
                                  Unpaid: Rs. {formatCurrency(ownerGroup.unpaidAmount)}{" "}
                                  ({((ownerGroup.unpaidAmount / ownerGroup.totalAmount) * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-[#123D32]/40">—</span>
                        </td>
                      </tr>

                      {/* LEVEL 2 & 3 */}
                      {isOwnerExpanded && Object.values(ownerGroup.properties).map((propGroup, pIdx) => {
                        const property = propGroup.property;
                        const isPropertyExpanded = expandedProperties[property.property_id];

                        // Compute period range for property group
                        const firstPeriod = propGroup.installments[0]?.periodLabel;
                        const lastPeriod = propGroup.installments[propGroup.installments.length - 1]?.periodLabel;
                        const periodRange = !firstPeriod || firstPeriod === "-"
                          ? "-"
                          : (firstPeriod === lastPeriod || !lastPeriod ? firstPeriod : `${firstPeriod} - ${lastPeriod}`);

                        return (
                          <React.Fragment key={property.property_id + pIdx}>
                            {/* LEVEL 2: Property Info Row */}
                            <tr
                              className="cursor-pointer transition-all hover:bg-[#C6A15B]/10 border-b border-[#1F6B4F]/10 bg-[#F8FAF9]"
                              onClick={() => toggleProperty(property.property_id)}
                            >
                              <td colSpan={2} className="py-3.5 pl-[3.5rem] border-l-4 border-l-[#C6A15B]">
                                <div className="flex items-center gap-3">
                                  {isPropertyExpanded ? (
                                    <ChevronDown size={16} className="text-[#C6A15B] shrink-0" />
                                  ) : (
                                    <ChevronRight size={16} className="text-[#123D32]/40 shrink-0" />
                                  )}
                                  <div>
                                    <div className="text-sm font-bold text-[#123D32]">
                                      <span className="text-[#C6A15B]">{property.property_number}</span> — {property.building_name}
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-semibold tracking-wider text-[#123D32]/60 uppercase">
                                      {property.floor || "N/A"} • {property.type}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3.5">
                                <div className="text-xs font-bold text-[#123D32]">{periodRange}</div>
                                <div className="text-[11px] font-medium text-[#123D32]/60">{propGroup.installmentCount} Installment{propGroup.installmentCount > 1 ? "s" : ""}</div>
                              </td>
                              <td className="px-6 py-3.5">
                                <div className="text-sm font-bold text-[#123D32]">Rs. {formatCurrency(propGroup.totalAmount)}</div>
                                {(propGroup.overdueAmount > 0 || propGroup.unpaidAmount > 0) && (
                                  <div className="mt-1 flex flex-col gap-0.5 text-[11px]">
                                    {propGroup.overdueAmount > 0 && (
                                      <span className="font-medium text-[#ef4444]">
                                        Overdue: Rs. {formatCurrency(propGroup.overdueAmount)}{" "}
                                        ({((propGroup.overdueAmount / propGroup.totalAmount) * 100).toFixed(1)}%)
                                      </span>
                                    )}
                                    {propGroup.unpaidAmount > 0 && (
                                      <span className="font-medium text-[#f59e0b]">
                                        Unpaid: Rs. {formatCurrency(propGroup.unpaidAmount)}{" "}
                                        ({((propGroup.unpaidAmount / propGroup.totalAmount) * 100).toFixed(1)}%)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="text-xs font-semibold text-[#123D32]/40">—</span>
                              </td>
                            </tr>

                            {/* LEVEL 3: Installment Rows */}
                            {isPropertyExpanded && propGroup.installments.map((instRow, iIdx) => (
                              <tr key={instRow.rowKey} className="transition-all hover:bg-[#C6A15B]/5 border-b border-[#1F6B4F]/10 bg-white">
                                <td colSpan={2} className="py-3 pl-[4.5rem]">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#C6A15B]/10 text-[#C6A15B] border border-[#C6A15B]/25 shadow-2xs">
                                      <Calendar size={13} />
                                    </div>
                                    <span className="text-xs font-bold text-[#123D32] tracking-wide">{instRow.periodLabel}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-xs font-medium text-[#123D32]/70">
                                    {instRow.installment?.dueDate
                                      ? new Date(instRow.installment.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                      : instRow.periodLabel || "—"}
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-sm font-bold text-[#123D32]">Rs. {formatCurrency(instRow.displayAmount)}</span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase border ${
                                    instRow.displayStatus === "Overdue"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : instRow.displayStatus === "Unpaid"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
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