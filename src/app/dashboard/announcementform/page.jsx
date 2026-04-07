"use client";

import { useEffect, useState } from "react";
import { announcementAPI } from "@/api/annoucement";
import toast from "react-hot-toast";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Megaphone,
  Calendar,
  Clock,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: ""
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getAllAnnouncements();
      if (response.success) {
        setAnnouncements(response.banners || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateModal = () => {
    setEditMode(false);
    setFormData({
      title: "",
      description: "",
      start_datetime: "",
      end_datetime: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (announcement) => {
    setEditMode(true);
    setSelectedAnnouncement(announcement);
    
    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const formatForInput = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    };

    setFormData({
      title: announcement.title || "",
      description: announcement.description || "",
      start_datetime: formatForInput(announcement.start_datetime),
      end_datetime: formatForInput(announcement.end_datetime)
    });
    setIsModalOpen(true);
  };

  const openDetailModal = async (id) => {
    try {
      const response = await announcementAPI.getAnnouncementById(id);
      if (response.success) {
        setSelectedAnnouncement(response.banner);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch announcement details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.start_datetime || !formData.end_datetime) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editMode) {
        response = await announcementAPI.updateAnnouncement(selectedAnnouncement.banner_id, formData);
        if (response.success) toast.success("Announcement updated successfully!");
      } else {
        response = await announcementAPI.createAnnouncement(formData);
        if (response.success) toast.success("Announcement added successfully!");
      }

      if (response.success) {
        setIsModalOpen(false);
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await announcementAPI.deleteAnnouncement(id);
      if (response.success) {
        toast.success("Announcement deleted successfully!");
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete announcement");
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-yellow-600" />
              Announcements
            </h1>
            <p className="mt-2 text-slate-500">Manage promotional banners and system announcements.</p>
          </div>

          <button 
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            New Announcement
          </button>
        </div>

        {/* Filters/Search */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-yellow-600" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all shadow-sm"
          />
        </div>

        {/* List Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Content</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Schedule</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(4).fill(0).map((_, j) => (
                        <td key={j} className="px-8 py-6">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((item) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={item.banner_id} 
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col max-w-xs">
                          <span className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</span>
                          <span className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-tight">
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Clock className="h-3 w-3" />
                            <span>Start: {formatDate(item.start_datetime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-rose-600">
                            <Clock className="h-3 w-3" />
                            <span>End: {formatDate(item.end_datetime)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {isExpired(item.end_datetime) ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 italic">
                            Expired
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openDetailModal(item.banner_id)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            title="View Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-yellow-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.banner_id)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white hover:shadow-lg transition-all border border-slate-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                         <Megaphone className="h-12 w-12 text-slate-200 mb-4" />
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No announcements found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-500 via-yellow-600 to-yellow-500" />
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <form onSubmit={handleSubmit} className="p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm">
                    {editMode ? <Edit className="h-5 w-5 text-yellow-600" /> : <Plus className="h-5 w-5 text-yellow-600" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {editMode ? "Modify Announcement" : "Add Announcement"}
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {editMode ? "Update details" : "Create a new banner"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Headline Title
                    </label>
                    <input 
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. New Project Launch"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all placeholder:font-normal placeholder:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      Description
                    </label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter details..."
                      rows={2}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-600/5 focus:border-yellow-600 transition-all placeholder:font-normal placeholder:opacity-50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Calendar className="h-3 w-3" /> Start Date
                      </label>
                      <input 
                        name="start_datetime"
                        type="datetime-local"
                        value={formData.start_datetime}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Calendar className="h-3 w-3" /> End Date
                      </label>
                      <input 
                        name="end_datetime"
                        type="datetime-local"
                        value={formData.end_datetime}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-xl font-bold text-xs tracking-wide hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                    {submitting ? "..." : (editMode ? "Update" : "Create")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsDetailModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-600" />
              
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-yellow-50 text-yellow-600 mb-4">
                  <Megaphone className="h-6 w-6" />
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                   {isExpired(selectedAnnouncement.end_datetime) ? (
                     <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-500 border border-rose-100">Expired</span>
                   ) : (
                     <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-500 border border-emerald-100">Active</span>
                   )}
                 </div>
                <h3 className="text-2xl font-bold text-slate-800">{selectedAnnouncement.title}</h3>
               
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Description</label>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {selectedAnnouncement.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Starts At</label>
                    <span className="text-xs font-bold text-slate-800">{formatDate(selectedAnnouncement.start_datetime)}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ends At</label>
                    <span className="text-xs font-bold text-slate-800">{formatDate(selectedAnnouncement.end_datetime)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                   <button 
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openEditModal(selectedAnnouncement);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-yellow-600/20 hover:bg-yellow-700 transition-all"
                   >
                     <Edit className="h-4 w-4" /> Edit Announcement
                   </button>
                   <button 
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleDelete(selectedAnnouncement.banner_id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all"
                   >
                     <Trash2 className="h-4 w-4" /> Delete
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}