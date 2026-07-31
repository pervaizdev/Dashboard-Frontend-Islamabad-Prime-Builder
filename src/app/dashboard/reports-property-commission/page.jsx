"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Loader2, User, History, Search, X, Filter, Building2, Layers } from "lucide-react";
import ReportsPropertyModal from "@/components/modals/ReportsPropertyModal";
import { dashboardAPI } from "@/api/dashboard";
import toast from "react-hot-toast";
import ExpendableInstallmentRow from "@/components/expendableinsalmentrow";
import Pagination from "@/components/pagination";
import PropertyCommissionStats from "@/components/property-commission-stats";
import PropertyCommissionCharts from "@/components/property-commission-charts";

const Page = () => {
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
  const [allocationsList, setAllocationsList] = useState(["Partner", "Other"]);
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

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
    <div className=" px-4 sm:px-6 lg:px-8 py-10 lg:py-10">
      {/* Top Header & Filter Controls Bar */}
      <div className="rounded-3xl border border-[#C6A15B]/20 bg-white p-6 sm:p-8 shadow-sm overflow-visible mb-8">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 pb-6 border-b border-[#C6A15B]/20">
          <div>
            <h1 className="text-2xl font-bold text-[#123D32] sm:text-3xl">Property Financial Reports</h1>
            <p className="mt-1 text-sm text-[#123D32]/60">View commission, allocation, and installment details for properties.</p>
          </div>
        </div>

        {/* Filter Form Grid matching reference layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-[#123D32]/60 mb-1.5 uppercase tracking-wider">Search</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search owner or property..."
                className="w-full px-3.5 py-2.5 bg-[#C6A15B]/5 border border-[#C6A15B]/30 rounded-xl text-xs font-semibold text-[#123D32]/90 placeholder-[#123D32]/40 outline-none focus:ring-2 focus:ring-[#C6A15B]/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#C6A15B] hover:text-[#123D32]/80"
                >
                  <X size={14} />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && ownerSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#C6A15B]/30 shadow-xl rounded-xl overflow-hidden py-1 max-h-48 overflow-y-auto">
                  {ownerSuggestions.map((name, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(name)}
                      className="px-4 py-2 text-xs font-medium text-[#123D32]/90 hover:bg-[#C6A15B]/10 cursor-pointer flex items-center space-x-2"
                    >
                      <User size={14} className="text-[#C6A15B]" />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Building */}
          <div>
            <label className="block text-xs font-bold text-[#123D32]/60 mb-1.5 uppercase tracking-wider">Building</label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#C6A15B]/5 border border-[#C6A15B]/30 rounded-xl text-xs font-bold text-[#123D32]/90 outline-none focus:ring-2 focus:ring-[#C6A15B]/50 cursor-pointer transition-all"
            >
              <option value="">All Buildings</option>
              {buildingsList.map((b, idx) => (
                <option key={idx} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Allocation Type */}
          <div>
            <label className="block text-xs font-bold text-[#123D32]/60 mb-1.5 uppercase tracking-wider">Allocation Type</label>
            <select
              value={selectedAllocation}
              onChange={(e) => setSelectedAllocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#C6A15B]/5 border border-[#C6A15B]/30 rounded-xl text-xs font-bold text-[#123D32]/90 outline-none focus:ring-2 focus:ring-[#C6A15B]/50 cursor-pointer transition-all"
            >
              <option value="">All Allocations</option>
              {allocationsList.map((a, idx) => (
                <option key={idx} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Date From & Date To */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#123D32]/60 mb-1.5 uppercase tracking-wider">Date From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#C6A15B]/5 border border-[#C6A15B]/30 rounded-xl text-xs font-semibold text-[#123D32]/90 outline-none focus:ring-2 focus:ring-[#C6A15B]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#123D32]/60 mb-1.5 uppercase tracking-wider">Date To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#C6A15B]/5 border border-[#C6A15B]/30 rounded-xl text-xs font-semibold text-[#123D32]/90 outline-none focus:ring-2 focus:ring-[#C6A15B]/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-[#C6A15B]/20">
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 text-xs font-bold text-[#123D32]/80 hover:text-[#123D32] bg-[#C6A15B]/10 hover:bg-[#C6A15B]/20 rounded-xl transition-all"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#C6A15B] hover:bg-[#123D32] rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            Apply Filters
          </button>
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
};

export default Page;  