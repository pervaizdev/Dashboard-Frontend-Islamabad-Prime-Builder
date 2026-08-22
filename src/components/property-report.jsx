"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Loader2, User, History, X, ChevronDown } from "lucide-react";
import ReportsPropertyModal from "@/components/modals/ReportsPropertyModal";
import { dashboardAPI } from "@/api/dashboard";
import toast from "react-hot-toast";
import ExpendableInstallmentRow from "@/components/expendableinsalmentrow";
import Pagination from "@/components/pagination";
import PropertyCommissionStats from "@/components/property-commission-stats";
import PropertyCommissionCharts from "@/components/property-commission-charts";

export default function PropertyReportComponent() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter states
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedAllocation, setSelectedAllocation] = useState("Other");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [activeFilterParams, setActiveFilterParams] = useState("allocationType=Other");

  const [buildingsList, setBuildingsList] = useState([]);
  const [allocationsList] = useState(["Partner", "Other"]);
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Custom dropdown open states & refs
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);

  const searchInputRef = useRef(null);
  const searchRef = useRef(null);
  const buildingRef = useRef(null);
  const allocationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buildingRef.current && !buildingRef.current.contains(event.target)) {
        setIsBuildingOpen(false);
      }
      if (allocationRef.current && !allocationRef.current.contains(event.target)) {
        setIsAllocationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleRow = (id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (selectedBuilding) params.append("building_name", selectedBuilding);
    if (selectedAllocation) params.append("allocationType", selectedAllocation);
    if (searchTerm) params.append("search", searchTerm);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return params.toString();
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    const q = buildQueryString();
    setActiveFilterParams(q);
    setShowSuggestions(false);
    setIsBuildingOpen(false);
    setIsAllocationOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedBuilding("");
    setSelectedAllocation("Other");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setActiveFilterParams("allocationType=Other");
    setShowSuggestions(false);
    setIsBuildingOpen(false);
    setIsAllocationOpen(false);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);

        const reportQuery = `page=${currentPage}&limit=${limit}${activeFilterParams ? `&${activeFilterParams}` : ''}`;

        const [reportsRes, statsRes] = await Promise.all([
          dashboardAPI.getPropertyCommissionReports(reportQuery),
          dashboardAPI.getPropertyCommissionStats(activeFilterParams)
        ]);

        if (reportsRes.success) {
          setProperties(reportsRes.properties || []);
          if (reportsRes.buildings && reportsRes.buildings.length > 0) {
            setBuildingsList(reportsRes.buildings);
          }
          if (reportsRes.ownerSuggestions) {
            setOwnerSuggestions(reportsRes.ownerSuggestions);
          }
          if (reportsRes.pagination) {
            setTotalPages(reportsRes.pagination.totalPages);
            setTotalRecords(reportsRes.pagination.totalRecords);
          }
        }

        if (statsRes.success) {
          setStats(statsRes.stats);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentPage, limit, activeFilterParams]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
  };

  const openModal = (property, type = 'installments') => {
    setSelectedProperty(property);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setModalType(null);
  };

  return (
    <div className="space-y-8">
      <div className="overflow-visible rounded-[26px] border border-[#123D32]/10 bg-white shadow-[0_12px_35px_rgba(18,61,50,0.08)] mt-8">
        <div className="relative overflow-hidden rounded-t-[26px] bg-[#123D32] px-6 py-6 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#E5C476] sm:text-[30px]">
            Property Financial Reports
          </h1>
        </div>
        <div className="px-5 py-6 sm:px-8">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="relative xl:col-span-3" ref={searchRef}>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
                Search
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search owner or property..."
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
                {showSuggestions && ownerSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[#C6A15B]/20 bg-white p-1.5 shadow-[0_15px_35px_rgba(18,61,50,0.15)]">
                    {ownerSuggestions.map((name, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(name)}
                        className="cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold text-[#123D32] transition-colors hover:bg-[#C6A15B]/10"
                      >
                        <span className="truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative xl:col-span-3" ref={buildingRef}>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
                Building
              </label>

              <button
                type="button"
                onClick={() => setIsBuildingOpen((prev) => !prev)}
                className="flex h-[47px] w-full cursor-pointer items-center justify-between rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 text-xs font-bold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
              >
                <span className="truncate">
                  {selectedBuilding || "All Buildings"}
                </span>
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
                      setSelectedBuilding("");
                      setIsBuildingOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${selectedBuilding === ""
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
            <div className="relative xl:col-span-3" ref={allocationRef}>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
                Allocation Type
              </label>
              <button
                type="button"
                onClick={() => setIsAllocationOpen((prev) => !prev)}
                className="flex h-[47px] w-full cursor-pointer items-center justify-between rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 text-xs font-bold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
              >
                <span className="truncate">
                  {selectedAllocation === ""
                    ? "All Allocations"
                    : selectedAllocation === "Other"
                      ? "Client"
                      : selectedAllocation}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#A7B2AE] transition-transform duration-200 ${isBuildingOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
              {isAllocationOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 space-y-1 overflow-y-auto rounded-xl border border-[#C6A15B]/20 bg-white p-1.5 shadow-[0_15px_35px_rgba(18,61,50,0.15)]">
                  <div
                    onClick={() => {
                      setSelectedAllocation("");
                      setIsAllocationOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${selectedAllocation === ""
                      ? "bg-[#123D32] text-[#E1BE73]"
                      : "text-[#123D32]/75 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                      }`}
                  >
                    All Allocations
                  </div>
                  {allocationsList.map((a, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedAllocation(a);
                        setIsAllocationOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${selectedAllocation === a
                        ? "bg-[#123D32] text-[#E1BE73]"
                        : "text-[#123D32]/75 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
                        }`}
                    >
                      {a === "Other" ? "Client" : a}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="xl:col-span-3">
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-[5px] z-10 text-[8px] font-bold uppercase tracking-wider text-[#123D32]/35">
                    From
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-2.5 py-2.5 pt-5 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
                  />
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-[5px] z-10 text-[8px] font-bold uppercase tracking-wider text-[#123D32]/35">
                    To
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-2.5 py-2.5 pt-5 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex lg:justify-end justify-center gap-7 border-t border-[#123D32]/10 pt-5 ">
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-[42px] cursor-pointer rounded-xl border border-[#123D32]/25 bg-white px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#123D32]/75 transition-all duration-200 hover:border-[#C6A15B]/45 hover:bg-[#C6A15B]/10 hover:text-[#123D32]"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="h-[42px] cursor-pointer rounded-xl bg-[#123D32] px-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0"
              >
                Apply Filters
              </button>
          </div>
        </div>
      </div>
      <PropertyCommissionStats stats={stats} loading={statsLoading} />
      <PropertyCommissionCharts stats={stats} loading={statsLoading} />

      <div className="rounded-2xl border border-[#C6A15B]/30 bg-white shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#1F6B4F]/20">
            <thead className="bg-[#123D32]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Owner / Broker</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Building / Floor / No</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Type / Category</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Price Details</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Installments Details</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Payment Plan</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#1F6B4F]/10">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-[#123D32]/60">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#C6A15B]" />
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-[#123D32]/60">
                    No properties found.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <React.Fragment key={property.property_id}>
                    <tr onClick={() => toggleRow(property.property_id)} className="hover:bg-[#C6A15B]/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">
                        <div className="font-medium text-[#123D32]">
                          {property.owners && property.owners.length > 0
                            ? property.owners.map(o => o.name).join(', ')
                            : 'No Owner'}
                        </div>
                        {property.brokers && property.brokers.length > 0 && (
                          <div className="text-xs text-[#123D32]/60 mt-0.5">
                            Broker: {property.brokers.map(b => b.name).join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">
                        <div className="font-medium text-[#123D32]">{property.building_name}</div>
                        <div className="text-xs">Floor number: {property.floor} </div>
                        <div className="text-xs">Property number: {property.property_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">
                        <div className="font-medium text-[#123D32]">{property.type}</div>
                        <div className="text-xs">{property.category}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">{property.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">
                        <div><span className="font-medium text-[#123D32]/90">Total Worth:</span> Rs {property.total_price?.toLocaleString() || 0}</div>
                        <div className="text-xs mt-0.5"><span className="font-medium text-[#123D32]/90">Down Payment:</span> Rs {property.down_payment?.toLocaleString() || 0}</div>
                        <div className="text-xs mt-0.5"><span className="font-medium text-[#123D32]/90">Paid Deposit Amount : </span> Rs {property.paid_downpayment?.toLocaleString() || 0}</div>
                        <div className="text-xs mt-0.5">
                          <span className="font-medium text-[#123D32]/90">Total Installment:</span> Rs {(property.installments?.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0) || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">
                        {(() => {
                          const totalInstallments = property.installments?.length || 0;
                          const paidInstallments = property.installments?.filter(i => i.status === 'Paid').length || 0;
                          const remainingInstallments = totalInstallments - paidInstallments;

                          const totalAmount = property.installments?.reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
                          const paidAmount = property.installments?.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
                          const remainingAmount = totalAmount - paidAmount;

                          return (
                            <>
                              <div className="text-xs mt-0.5"><span className="font-medium text-[#123D32]/90">Paid Installment :</span> Rs {paidAmount.toLocaleString()}</div>
                              <div className="text-xs mt-0.5"><span className="font-medium text-[#123D32]/90">Remaining Installment :</span> Rs {remainingAmount.toLocaleString()}</div>
                              <div className="text-xs mt-1.5"><span className="font-medium text-[#123D32]/90">Total Installments:</span> {totalInstallments}</div>
                              <div className="text-xs mt-0.5"><span className="font-medium text-[#123D32]/90">Paid:</span> {paidInstallments} <span className="mx-1">|</span> <span className="font-medium text-[#123D32]/90">Remaining:</span> {remainingInstallments}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#123D32]/60">
                        <div className="text-xs capitalize mt-1.5"><span className="bg-[#C6A15B]/10 text-[#123D32]/90 font-medium text-xs px-2 py-0.5 rounded-full border border-[#C6A15B]/30">{property.payment_plan}</span></div>

                        <div className='mt-2'>
                          <span className={`mt-2 bg-[#C6A15B]/10 text-[#123D32]/90 font-medium text-xs px-2 py-0.5 rounded-full border border-[#C6A15B]/30 ${property.transferHistory && property.transferHistory.length > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-[#C6A15B]/10 text-[#123D32]/90 border-[#C6A15B]/30'
                            }`}>
                            {property.transferHistory && property.transferHistory.length > 0 ? 'Transferred' : 'Owner'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-3">
                          {/* Owner */}
                          <div className="relative group">
                            <button
                              onClick={() => openModal(property, 'owner')}
                              className="text-[#C6A15B] hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-blue-50"
                            >
                              <User size={18} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-[#123D32] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Owner</span>
                          </div>

                          {/* Broker */}
                          {property.brokers && property.brokers.length > 0 && (
                            <div className="relative group">
                              <button
                                onClick={() => openModal(property, 'broker')}
                                className="text-[#C6A15B] hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-emerald-50"
                              >
                                <Users size={18} />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-[#123D32] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Broker</span>
                            </div>
                          )}

                          {/* Transfer History */}
                          {property.transferHistory && property.transferHistory.length > 0 && (
                            <div className="relative group">
                              <button
                                onClick={() => openModal(property, 'transfer')}
                                className="text-[#C6A15B] hover:text-amber-600 transition-colors p-1 rounded-lg hover:bg-amber-50"
                              >
                                <History size={18} />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-[#123D32] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Transfer History</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRowId === property.property_id && (
                      <ExpendableInstallmentRow property={property} />
                    )}
                  </React.Fragment>
                ))
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
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modal */}
      <ReportsPropertyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedProperty={selectedProperty}
        modalType={modalType}
      />
    </div>
  );
}
