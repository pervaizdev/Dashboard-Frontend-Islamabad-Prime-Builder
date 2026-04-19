"use client";

import { useEffect, useState } from "react";
import { propertyAPI } from "@/api/property";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Loader2,
  Search,
  Building2,
  Home,
  ArrowLeft,
  ArrowRight,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Maximize2,
  Calendar,
  Layers,
  Component
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading, propertyName }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl premium-border-glow text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto">
            <Trash2 size={32} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-800">Delete Property?</h3>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-800">{propertyName}</span>? This action is permanent and cannot be reversed.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete Now"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function PropertyListPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProperty = (e, property) => {
    e.stopPropagation();
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      setIsDeleting(true);
      const res = await propertyAPI.deleteProperty(propertyToDelete.property_id);
      if (res.success) {
        toast.success("Property deleted successfully");
        setDeleteModalOpen(false);
        fetchProperties();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchProperties = async (pageNum = page, search = searchTerm) => {
    try {
      setLoading(true);
      const data = await propertyAPI.getAllProperties({
        page: pageNum,
        limit: 10,
        search: search
      });
      if (data.success) {
        setProperties(data.properties || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProperties(1, searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProperties(newPage, searchTerm);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Property Inventory</h1>
            <p className="mt-2 text-slate-500 font-medium">Manage and monitor all listed properties in the building.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:max-w-md">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-yellow-600" />
              <input
                type="text"
                placeholder="Search properties (number, type, floor...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all shadow-sm"
              />
            </div>
            <button className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-yellow-600 hover:border-yellow-600 transition-all shadow-sm">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary (Optional) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Properties</span>
            <span className="text-2xl font-bold text-slate-800">{totalCount}</span>
          </div>
          {/* Add more stats if needed */}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Building Info</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Financials</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-8 py-6">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : properties.length > 0 ? (
                  properties.map((property) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={property._id}
                      onClick={() => router.push(`/dashboard/proporitydetail?id=${property.property_id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-all group relative"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm text-yellow-600">
                            {property.type?.toLowerCase() === "shop" ? <Building2 className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col min-w-[120px]">
                            <span className="text-sm font-bold text-slate-800">{property.property_number}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{property.type} • {property.size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <Layers className="h-3 w-3 text-slate-400" />
                            {property.building_name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                            <Component className="h-3 w-3" />
                            {property.floor} Floor • {property.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-emerald-600">Rs. {property.total_price?.toLocaleString()}</span>
                          <span className="text-[11px] font-medium text-slate-400">DP: {property.down_payment?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${property.payment_plan === "monthly" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-orange-50 text-orange-600 border border-orange-100"}`}>
                          {property.payment_plan}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                         ${property.property_owned_status === "Owned"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {property.property_owned_status === "Owned"
                            ? "Owned"
                            : "Transferred"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/proporitydetail?id=${property.property_id}`)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all border border-slate-100"
                            title="View Details"
                          >
                            <ArrowRight size={16} />
                          </button>
                          {(user.role === "super-admin" ) && (
                            <>
                              <button
                                onClick={() => router.push(`/dashboard/properityform?id=${property.property_id}`)}
                                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
                                title="Edit Property"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={(e) => handleDeleteProperty(e, property)}
                                className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-100"
                                title="Delete Property"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <Maximize2 className="h-16 w-16 text-slate-200 mb-6" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No properties matches your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-800">{properties.length}</span> of <span className="text-slate-800">{totalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`h-10 w-10 rounded-xl font-bold text-xs transition-all
                        ${page === i + 1
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        propertyName={propertyToDelete?.property_number}
      />
    </div>
  );
}
