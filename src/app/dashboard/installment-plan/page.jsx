"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock3,
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

import ExpendableInstallmentRow from "@/components/expendableinsalmentrow";

/* -------------------------------------------------------------------------- */
/*                                  Mock Data                                 */
/* -------------------------------------------------------------------------- */

const INITIAL_PROPERTIES = [
  {
    property_id: "PROP-001",
    owner_name: "Muhammad Raheem",
    broker_name: null,
    building_name: "Prime Mall And Suites",
    floor: "Ground Floor",
    property_number: "03",
    type: "Shop",
    category: "Commercial",
    size: "257 Sqft",
    payment_plan: "Monthly",
    status: "Unpaid",
    installments: [
      {
        monthYear: "Jul 2026",
        amount: 299800.97,
        status: "Payment Overdue",
        dueDate: "2026-07-01",
        paidDate: null,
      },
      {
        monthYear: "Aug 2026",
        amount: 299800.97,
        status: "Unpaid",
        dueDate: "2026-08-01",
        paidDate: null,
      },
      {
        monthYear: "Sep 2026",
        amount: 299800.97,
        status: "Unpaid",
        dueDate: "2026-09-01",
        paidDate: null,
      },
    ],
  },
  {
    property_id: "PROP-002",
    owner_name: "Hamid Hussain Ansari",
    broker_name: "Hamid Hussain Ansari",
    building_name: "Prime Mall And Suites",
    floor: "Lower Ground",
    property_number: "08",
    type: "Shop",
    category: "Commercial",
    size: "237 Sqft",
    payment_plan: "Monthly",
    status: "Unpaid",
    installments: [
      {
        monthYear: "Jul 2026",
        amount: 230416.67,
        status: "Paid",
        dueDate: "2026-07-01",
        paidDate: "2026-07-02",
        receiptImage:
          "https://via.placeholder.com/400?text=Receipt+Jul+2026",
      },
      {
        monthYear: "Aug 2026",
        amount: 230416.67,
        status: "Unpaid",
        dueDate: "2026-08-01",
        paidDate: null,
      },
      {
        monthYear: "Sep 2026",
        amount: 230416.67,
        status: "Unpaid",
        dueDate: "2026-09-01",
        paidDate: null,
      },
    ],
  },
  {
    property_id: "PROP-003",
    owner_name: "Ali Raza",
    broker_name: null,
    building_name: "Islamabad Prime Tower",
    floor: "1st Floor",
    property_number: "09",
    type: "Shop",
    category: "Commercial",
    size: "245 Sqft",
    payment_plan: "Monthly",
    status: "Unpaid",
    installments: [
      {
        monthYear: "Jul 2026",
        amount: 302361.11,
        status: "Paid",
        dueDate: "2026-07-01",
        paidDate: "2026-07-05",
        receiptImage:
          "https://via.placeholder.com/400?text=Receipt+Jul+2026",
      },
      {
        monthYear: "Aug 2026",
        amount: 302361.11,
        status: "Unpaid",
        dueDate: "2026-08-01",
        paidDate: null,
      },
    ],
  },
  {
    property_id: "PROP-004",
    owner_name: "Sana Khan",
    broker_name: "Usman Malik",
    building_name: "Executive Suites",
    floor: "3rd Floor",
    property_number: "701",
    type: "2 Bed",
    category: "Residential",
    size: "850 Sqft",
    payment_plan: "Monthly",
    status: "Unpaid",
    installments: [
      {
        monthYear: "Jul 2026",
        amount: 240487.81,
        status: "Paid",
        dueDate: "2026-07-01",
        paidDate: "2026-07-06",
        receiptImage:
          "https://via.placeholder.com/400?text=Receipt+Jul+2026",
      },
      {
        monthYear: "Aug 2026",
        amount: 240487.81,
        status: "Unpaid",
        dueDate: "2026-08-01",
        paidDate: null,
      },
    ],
  },
  {
    property_id: "PROP-005",
    owner_name: "Usman Ali",
    broker_name: null,
    building_name: "Prime Mall And Suites",
    floor: "4th Floor",
    property_number: "07",
    type: "Shop",
    category: "Commercial",
    size: "220 Sqft",
    payment_plan: "Monthly",
    status: "Payment Overdue",
    installments: [
      {
        monthYear: "Jul 2026",
        amount: 230416.67,
        status: "Payment Overdue",
        dueDate: "2026-07-01",
        paidDate: null,
      },
      {
        monthYear: "Aug 2026",
        amount: 230416.67,
        status: "Unpaid",
        dueDate: "2026-08-01",
        paidDate: null,
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Charts                                    */
/* -------------------------------------------------------------------------- */

const DONUT_DATA = [
  {
    name: "Paid",
    value: 0,
    color: "#10b981",
    percentage: "0.0%",
  },
  {
    name: "Unpaid",
    value: 43,
    color: "#dc2626",
    percentage: "89.6%",
  },
  {
    name: "Payment Overdue",
    value: 5,
    color: "#f97316",
    percentage: "10.4%",
  },
];

const BAR_DATA = [
  { month: "Sep-2025", downpayment: 0, installments: 0 },
  { month: "Oct-2025", downpayment: 0, installments: 0 },
  { month: "Nov-2025", downpayment: 0, installments: 0 },
  { month: "Dec-2025", downpayment: 0, installments: 0 },
  { month: "Jan-2026", downpayment: 0, installments: 0 },
  { month: "Feb-2026", downpayment: 0, installments: 0 },
  { month: "Mar-2026", downpayment: 0, installments: 0 },
  { month: "Apr-2026", downpayment: 0, installments: 0 },
  { month: "May-2026", downpayment: 0, installments: 0 },
  { month: "Jun-2026", downpayment: 0, installments: 0 },
  { month: "Jul-2026", downpayment: 126.92, installments: 5.82 },
  { month: "Aug-2026", downpayment: 0, installments: 0 },
];

/* -------------------------------------------------------------------------- */
/*                              Filter Options                                */
/* -------------------------------------------------------------------------- */

const BUILDING_OPTIONS = [
  "All Buildings",
  "Prime Mall And Suites",
  "Islamabad Prime Tower",
  "Executive Suites",
];

const FLOOR_OPTIONS = [
  { value: "All Floors", label: "All Floors" },
  { value: "Lower Ground", label: "Lower Ground" },
  { value: "Ground Floor", label: "Ground Floor" },
  { value: "1", label: "1st Floor" },
  { value: "2", label: "2nd Floor" },
  { value: "3", label: "3rd Floor" },
  { value: "4", label: "4th Floor" },
  { value: "5", label: "5th Floor" },
  { value: "6", label: "6th Floor" },
  { value: "7", label: "7th Floor" },
  { value: "8", label: "8th Floor" },
];

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const normalizeFloor = (floor = "") => {
  const normalizedFloor = String(floor)
    .toLowerCase()
    .replace(/(st|nd|rd|th)/g, "")
    .replace("floor", "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalizedFloor === "ground") {
    return "ground";
  }

  if (normalizedFloor === "lower ground") {
    return "lower ground";
  }

  return normalizedFloor;
};

const normalizeStatus = (status = "") =>
  String(status).toLowerCase().trim();

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

const InstallmentPlanPage = () => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] =
    useState("All Buildings");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    building: "All Buildings",
    floor: "All Floors",
  });

  const toggleRow = (propertyId) => {
    setExpandedRowId((currentId) =>
      currentId === propertyId ? null : propertyId,
    );
  };

  const handleApplyFilters = () => {
    setExpandedRowId(null);

    setAppliedFilters({
      search: searchTerm.trim(),
      building: selectedBuilding,
      floor: selectedFloor,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedBuilding("All Buildings");
    setSelectedFloor("All Floors");
    setExpandedRowId(null);

    setAppliedFilters({
      search: "",
      building: "All Buildings",
      floor: "All Floors",
    });
  };

  const filteredProperties = useMemo(() => {
    const normalizedSearch = appliedFilters.search.toLowerCase();

    return INITIAL_PROPERTIES.filter((property) => {
      const searchableValues = [
        property.property_id,
        property.owner_name,
        property.broker_name,
        property.building_name,
        property.floor,
        property.property_number,
        property.type,
        property.category,
        property.payment_plan,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      const matchesSearch =
        !normalizedSearch ||
        searchableValues.some((value) =>
          value.includes(normalizedSearch),
        );

      const matchesBuilding =
        appliedFilters.building === "All Buildings" ||
        property.building_name === appliedFilters.building;

      const propertyFloor = normalizeFloor(property.floor);
      const selectedFilterFloor = normalizeFloor(
        appliedFilters.floor,
      );

      const matchesFloor =
        appliedFilters.floor === "All Floors" ||
        propertyFloor === selectedFilterFloor;

      return matchesSearch && matchesBuilding && matchesFloor;
    });
  }, [appliedFilters]);

  /*
   * Default table records:
   * 1. Current-month unpaid/pending installments.
   * 2. Previous-month overdue installments.
   */
  const dueInstallments = useMemo(() => {
    const today = new Date();

    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    const nextMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );

    const previousMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );

    return filteredProperties
      .flatMap((property) =>
        property.installments
          .filter((installment) => {
            const dueDate = parseDate(installment.dueDate);

            if (!dueDate) {
              return false;
            }

            const installmentStatus = normalizeStatus(
              installment.status,
            );

            const isCurrentMonth =
              dueDate >= currentMonthStart &&
              dueDate < nextMonthStart;

            const isPreviousMonth =
              dueDate >= previousMonthStart &&
              dueDate < currentMonthStart;

            const isPending =
              installmentStatus === "unpaid" ||
              installmentStatus === "pending";

            const isOverdue =
              installmentStatus === "payment overdue" ||
              installmentStatus === "overdue" ||
              (isPreviousMonth && isPending);

            return (
              (isCurrentMonth && isPending) ||
              (isPreviousMonth && isOverdue)
            );
          })
          .map((installment) => {
            const dueDate = parseDate(installment.dueDate);

            const isCurrentMonth =
              dueDate >= currentMonthStart &&
              dueDate < nextMonthStart;

            return {
              ...installment,
              property,
              displayStatus: isCurrentMonth
                ? "Pending"
                : "Overdue",
              periodType: isCurrentMonth
                ? "Current"
                : "Previous",
            };
          }),
      )
      .sort((firstItem, secondItem) => {
        const firstDate = parseDate(firstItem.dueDate);
        const secondDate = parseDate(secondItem.dueDate);

        return firstDate - secondDate;
      });
  }, [filteredProperties]);

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      {/* Header and Filters */}
      <div className="rounded-2xl border border-[#ead8b9] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#123f35]">
            Installment Module
          </h1>

          <p className="mt-1 text-sm font-medium text-[#78938c]">
            Manage and track all installment plans in one place.
          </p>
        </div>

        <div className="my-5 h-px bg-[#efe3cf]" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label
              htmlFor="installment-search"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]"
            >
              Search
            </label>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#95aaa4]"
              />

              <input
                id="installment-search"
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                placeholder="Search owner or property..."
                className="h-11 w-full rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] pl-9 pr-3 text-sm font-medium text-[#244f45] outline-none transition placeholder:text-[#9bada8] focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15"
              />
            </div>
          </div>

          {/* Building */}
          <div>
            <label
              htmlFor="building-filter"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]"
            >
              Building
            </label>

            <select
              id="building-filter"
              value={selectedBuilding}
              onChange={(event) =>
                setSelectedBuilding(event.target.value)
              }
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15"
            >
              {BUILDING_OPTIONS.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label
              htmlFor="floor-filter"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6f8d85]"
            >
              Floor Type
            </label>

            <select
              id="floor-filter"
              value={selectedFloor}
              onChange={(event) =>
                setSelectedFloor(event.target.value)
              }
              className="h-11 w-full cursor-pointer rounded-xl border border-[#e8d4b2] bg-[#fcfbf9] px-3 text-sm font-semibold text-[#244f45] outline-none transition focus:border-[#cda65d] focus:ring-2 focus:ring-[#cda65d]/15"
            >
              {FLOOR_OPTIONS.map((floor) => (
                <option key={floor.value} value={floor.value}>
                  {floor.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mt-5 flex flex-col justify-end gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleClearFilters}
            className="h-10 rounded-xl bg-[#f7f3ec] px-5 text-sm font-semibold text-[#365f55] transition-colors hover:bg-[#efe8dc]"
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="h-10 rounded-xl bg-[#cda65d] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#b99148]"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Status Chart */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Installment Plans by Status
            </h2>
          </div>

          <div className="flex flex-col items-center justify-around sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {DONUT_DATA.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">
                  48
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  Total
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 sm:mt-0">
              {DONUT_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  <span className="min-w-[110px] text-xs font-semibold text-slate-600">
                    {item.name}
                  </span>

                  <span className="text-xs font-bold text-slate-800">
                    {item.value} ({item.percentage})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Chart */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-base font-bold text-slate-800">
              Collections Over Time
            </h2>

            <select className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-none">
              <option>Monthly (Last 12 Months)</option>
              <option>Yearly (Last 3 Years)</option>
            </select>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={BAR_DATA}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                  unit="M"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(value, name) => {
                    const label =
                      name === "installments"
                        ? "Paid Installment"
                        : "Unpaid Installment";

                    return [`${value}M`, label];
                  }}
                />

                <Bar
                  dataKey="installments"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />

                <Bar
                  dataKey="downpayment"
                  fill="#c29e6d"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#10b981]" />

              <span className="text-xs font-semibold text-slate-600">
                Paid Installment
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#c29e6d]" />

              <span className="text-xs font-semibold text-slate-600">
                Unpaid Installment
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Due Installments Table */}
      <div className="overflow-hidden rounded-2xl border border-[#ead8b9] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-[#eee5d8] bg-[#fbf8f3]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">
                  Property Info
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">
                  Period
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#8a8177]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eeeae4] bg-white">
              {dueInstallments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <div className="text-sm font-semibold text-slate-600">
                      No due installments found
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      There are no current-month pending or
                      previous-month overdue installments.
                    </p>
                  </td>
                </tr>
              ) : (
                dueInstallments.map((item, index) => {
                  const {
                    property,
                    amount,
                    monthYear,
                    dueDate,
                    displayStatus,
                  } = item;

                  const rowKey = `${property.property_id}-${dueDate}-${index}`;
                  const isOverdue =
                    displayStatus === "Overdue";

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className="transition-colors hover:bg-[#fcfaf7]">
                        {/* Property */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f1e8] text-[#c29e6d]">
                              <Building2 size={19} />
                            </div>

                            <div>
                              <div className="text-base font-bold text-slate-900">
                                {property.property_number}
                              </div>

                              <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {property.type}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Period */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Calendar
                              size={15}
                              className="text-[#c29e6d]"
                            />

                            <span className="text-sm font-semibold text-slate-700">
                              {monthYear}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <span className="text-base font-bold text-slate-900">
                            Rs. {formatCurrency(amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                              isOverdue
                                ? "bg-rose-50 text-rose-600"
                                : "bg-orange-50 text-orange-500"
                            }`}
                          >
                            <Clock3 size={13} />
                            {displayStatus}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              toggleRow(property.property_id)
                            }
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all ${
                              expandedRowId ===
                              property.property_id
                                ? "bg-[#c29e6d] text-white"
                                : "bg-[#101827] text-white hover:bg-[#1f2937]"
                            }`}
                          >
                            Details
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>

                      {expandedRowId ===
                        property.property_id && (
                        <ExpendableInstallmentRow
                          property={property}
                        />
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#eeeae4] bg-white px-6 py-4 sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            {dueInstallments.length > 0
              ? `1 to ${dueInstallments.length}`
              : "0"}{" "}
            of {dueInstallments.length} results
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c29e6d] bg-[#f9f4eb] text-xs font-bold text-[#785c34]"
            >
              1
            </button>

            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallmentPlanPage;