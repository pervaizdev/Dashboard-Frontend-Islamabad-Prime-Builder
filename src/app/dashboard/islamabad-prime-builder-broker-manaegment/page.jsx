"use client";

import { useEffect, useState } from "react";
import { brokersAPI } from "@/api/brokers";
import toast from "react-hot-toast";
import {
  Loader2,
  Search,
  Edit,
  Trash2,
  User,
  Plus,
  X,
  BadgeDollarSign,
  CreditCard,
  ChevronRight,
  CircleDollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BrokerManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [overallStats, setOverallStats] = useState({
    total_commission: 0,
    total_paid: 0,
    total_balance: 0,
    properties_count: 0
  });

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedBroker, setSelectedBroker] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    residential_address: "",
    isActive: true
  });

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await brokersAPI.getAllBrokers();
      if (response.success) {
        setBrokers(response.brokers || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch brokers");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const response = await brokersAPI.getOverallBrokerStats();
      if (response.success) {
        setOverallStats(response.stats);
      }
    } catch (error) {
      console.error("Failed to fetch overall stats", error);
    }
  };

  useEffect(() => {
    fetchBrokers();
    fetchOverallStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      cnic: "",
      phone: "",
      residential_address: "",
      isActive: true
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (broker) => {
    setSelectedBroker(broker);
    setFormData({
      name: broker.name || "",
      cnic: broker.cnic || "",
      phone: broker.phone || "",
      residential_address: broker.residential_address || "",
      isActive: broker.isActive ?? true
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (broker) => {
    setSelectedBroker(broker);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      let response;
      if (isEditModalOpen) {
        response = await brokersAPI.updateBroker(selectedBroker.broker_id, formData);
      } else {
        response = await brokersAPI.createBroker(formData);
      }

      if (response.success) {
        toast.success(isEditModalOpen ? "Broker updated!" : "Broker added!");
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        fetchBrokers();
      }
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setProcessing(true);
    try {
      const response = await brokersAPI.deleteBroker(selectedBroker.broker_id);
      if (response.success) {
        toast.success("Broker deleted successfully");
        setIsDeleteModalOpen(false);
        fetchBrokers();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete broker");
    } finally {
      setProcessing(false);
    }
  };

  const filteredBrokers = (brokers || []).filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.cnic?.includes(searchTerm) ||
    b.phone?.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Broker Management</h1>
            <p className="mt-2 text-slate-500">View and manage registered brokers in Islamabad Prime Builder.</p>
          </div>

          {user?.role === "super-admin" && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-5 w-5" />
              Add Broker
            </button>
          )}
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Commission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 transition-all duration-300 premium-border-glow"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            <div className="flex items-start justify-between">
              <h3 className="font-serif text-lg font-semibold mt-3 text-neutral-700">
                Total Commission
              </h3>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <CircleDollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-body text-xl font-semibold tracking-tight text-neutral-800">
                Rs. {(overallStats.total_commission || 0).toLocaleString()}
              </h4>
            </div>

            <div className="mt-2 border-t border-primary/5 pt-3">
              <p className="text-[11px] font-medium text-neutral-400 italic font-body">
                Aggregate commission assigned
              </p>
            </div>
          </motion.div>

          {/* Total Paid Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 transition-all duration-300 premium-border-glow"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            <div className="flex items-start justify-between">
              <h3 className="font-serif text-lg font-semibold mt-3 text-neutral-700">
                Total Paid
              </h3>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-body text-xl font-semibold tracking-tight text-neutral-800">
                Rs. {(overallStats.total_paid || 0).toLocaleString()}
              </h4>
            </div>

            <div className="mt-2 border-t border-primary/5 pt-3">
              <p className="text-[11px] font-medium text-neutral-400 italic font-body">
                Total disbursements to brokers
              </p>
            </div>
          </motion.div>

          {/* Remaining Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-6 transition-all duration-300 premium-border-glow border-l-4 border-l-yellow-500"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            <div className="flex items-start justify-between">
              <h3 className="font-serif text-lg font-semibold mt-3 text-neutral-700">
                Remaining Balance
              </h3>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <BadgeDollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-body text-xl font-semibold tracking-tight text-neutral-800">
                Rs. {(overallStats.total_balance || 0).toLocaleString()}
              </h4>
            </div>

            <div className="mt-2 border-t border-primary/5 pt-3">
              <p className="text-[11px] font-medium text-neutral-400 italic font-body">
                Pending commission amount
              </p>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="flex justify-end w-full">
          <div className="relative group max-w-md w-full ">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-yellow-600" />
            <input
              type="text"
              placeholder="Search by name, CNIC, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Brokers Table Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Broker Info</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">CNIC</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-8 py-6">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredBrokers.length > 0 ? (
                  filteredBrokers.map((broker) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={broker.broker_id}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm text-yellow-600 font-bold uppercase">
                            {broker.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{broker.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{broker.residential_address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-slate-600">
                        {broker.cnic}
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-slate-600">
                        {broker.phone}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/broker-details?id=${broker.broker_id}`)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-yellow-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                          >
                           <ChevronRight className="h-5 w-5" />
                          </button>

                          {user?.role === "super-admin" && (
                            <button
                              onClick={() => handleEditClick(broker)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-yellow-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {user?.role === "super-admin" && (
                            <button 
                              onClick={() => handleDeleteClick(broker)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            >
                              <Trash2 className="h-4 w-4" />
                          </button>
                          )}
                        </div>

                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                      No brokers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-4xl shadow-2xl premium-border-glow overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-500 via-yellow-600 to-yellow-500" />

              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all font-bold"
              >
                <X className="h-5 w-5" />
              </button>

              <form onSubmit={handleSubmit} className="p-8 sm:p-12">
                <div className="mb-10 flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm">
                    <User className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{isEditModalOpen ? "Edit Broker" : "Add New Broker"}</h2>
                    <p className="text-sm text-slate-500 mt-1">Provide broker details for registration.</p>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  {/* Name, CNIC, Phone in one line */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Broker Name</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">CNIC Number</label>
                      <input
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleInputChange}
                        required
                        placeholder="71301-6445487-2"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="03001234567"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Residential Address</label>
                    <textarea
                      name="residential_address"
                      value={formData.residential_address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter full residential address..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {processing ? "Saving..." : (isEditModalOpen ? "Update Broker" : "Create Broker")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsDeleteModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl overflow-hidden p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
                <Trash2 className="h-10 w-10 text-rose-500" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Delete Broker?</h2>
              <p className="text-slate-500 mb-8 px-4 text-sm text-center">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedBroker?.name}</span>? This action is permanent.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={processing}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
