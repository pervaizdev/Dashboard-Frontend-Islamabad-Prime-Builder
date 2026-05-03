"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  FileText,
  Eye,
  Pencil,
  X,
  User,
  Phone,
  Mail,
  CalendarDays,
  MessageSquare,
  Loader2,
  Search,
  Maximize2,
  Trash2
} from "lucide-react";
import { contactMessageAPI } from "@/api/contactMessages";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading, itemName }) => {
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
          <h3 className="font-serif text-2xl font-bold text-slate-800">Delete Message?</h3>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete the message from <span className="font-bold text-slate-800">{itemName}</span>? This action is permanent.
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

const truncateWords = (text, wordLimit = 6) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

function DetailCard({ label, value, icon: Icon, fullWidth = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-700">{value || "N/A"}</p>
    </div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactMessageAPI.getAllMessages();
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateDescription = async () => {
    if (!editMessage) return;
    try {
      setIsUpdating(true);
      const response = await contactMessageAPI.updateDescription(
        editMessage.phone,
        description
      );
      if (response.success) {
        toast.success("Description updated successfully");
        setEditMessage(null);
        setDescription("");
        fetchMessages();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update description");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = (e, message) => {
    e.stopPropagation();
    setEditMessage(message);
    setDescription(message.description || "");
  };

  const handleDeleteClick = (e, message) => {
    e.stopPropagation();
    setMessageToDelete(message);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    try {
      setIsDeleting(true);
      const response = await contactMessageAPI.deleteMessage(messageToDelete._id);
      if (response.success) {
        toast.success("Message deleted successfully");
        setDeleteModalOpen(false);
        fetchMessages();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMessages = (messages || []).filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-14 px-6 lg:px-9 lg:mt-15">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="">
          <div className="item-center">
            <h1 className="text-3xl font-bold lg:text-6xl ">User <span className="text-primary">Messages</span></h1>
            <p className="text-sm md:text-base text-charcoal/50 font-body max-w-xl mx-auto md:mx-0 mt-6">Review and manage messages sent through the contact form.</p>
          </div>

          
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase">Sender</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase">Contact Info</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase">Message</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase">Date</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase">Actions</th>
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
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((item, index) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={index}
                      onClick={() => setSelectedMessage(item)}
                      className="hover:bg-slate-50 cursor-pointer transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm text-yellow-600 font-bold uppercase">
                            {item.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{item.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {item.phone}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            <Mail className="h-3 w-3 text-slate-300" />
                            {item.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-slate-600 max-w-xs font-medium">
                          {truncateWords(item.message, 6)}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-300" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMessage(item)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all border border-slate-100 shadow-sm"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, item)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm"
                            title="Update Description"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, item)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
                            title="Delete Message"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <Maximize2 className="h-16 w-16 text-slate-200 mb-6" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                          {searchTerm ? "No matches found" : "No messages yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={() => setSelectedMessage(null)}
              />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl premium-border-glow overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500" />
                
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <div className="mb-10 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm">
                      <MessageSquare className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">Message Details</h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailCard label="Full Name" value={selectedMessage.name} icon={User} />
                    <DetailCard label="Phone Number" value={selectedMessage.phone} icon={Phone} />
                    <DetailCard label="Email Address" value={selectedMessage.email} icon={Mail} />
                    <DetailCard
                      label="Reception Date"
                      value={new Date(selectedMessage.createdAt).toLocaleString()}
                      icon={CalendarDays}
                    />
                    <DetailCard
                      label="Sender Inquiry"
                      value={selectedMessage.message}
                      icon={MessageSquare}
                      fullWidth
                    />
                    <DetailCard
                      label="Description"
                      value={selectedMessage.description}
                      icon={FileText}
                      fullWidth
                    />
                  </div>

                  <div className="mt-10">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                    >
                      Close Inquiry
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Description Modal */}
        <AnimatePresence>
          {editMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={() => setEditMessage(null)}
              />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl premium-border-glow overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500" />
                
                <button
                  onClick={() => setEditMessage(null)}
                  className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <div className="mb-10 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm text-blue-600">
                      <Pencil className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">Update Description</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sender Name</label>
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500">
                          {editMessage.name}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500">
                          {editMessage.phone}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Inquiry Content</label>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 max-h-24 overflow-y-auto">
                        {editMessage.message}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        placeholder="Add Description"
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>

                    <div className="justify-center pt-4">
                      <button
                        onClick={handleUpdateDescription}
                        disabled={isUpdating}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isUpdating ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          loading={isDeleting}
          itemName={messageToDelete?.name}
        />
      </div>
    </div>
  );
}
