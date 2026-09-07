"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  X,
  User,
  Phone,
  Mail,
  CalendarDays,
  MessageSquare,
  MessageCircle,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { contactMessageAPI } from "@/api/contactMessages";
import MessagesTable from "@/components/dashboard/Contact_Message.jsx";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  itemName,
}) => {
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

          <h3 className="font-serif text-2xl font-bold text-slate-800">
            Delete Message?
          </h3>

          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete the message from{" "}
            <span className="font-bold text-slate-800">{itemName}</span>? This
            action is permanent.
          </p>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Delete Now"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
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

      <p className="mt-2 text-sm font-semibold text-slate-700">
        {value || "N/A"}
      </p>
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

  const handleEditClick = (event, message) => {
    event.stopPropagation();
    setEditMessage(message);
    setDescription(message.description || "");
  };

  const handleDeleteClick = (event, message) => {
    event.stopPropagation();
    setMessageToDelete(message);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      setIsDeleting(true);

      const response = await contactMessageAPI.deleteMessage(
        messageToDelete._id
      );

      if (response.success) {
        toast.success("Message deleted successfully");
        setDeleteModalOpen(false);
        setMessageToDelete(null);
        fetchMessages();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMessages = (messages || []).filter((message) => {
    const keyword = searchTerm.toLowerCase();

    return (
      message.name?.toLowerCase().includes(keyword) ||
      message.email?.toLowerCase().includes(keyword) ||
      message.phone?.toLowerCase().includes(keyword) ||
      message.message?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="container mx-auto mb-5">
      <div>
        <MessagesTable
          loading={loading}
          messages={filteredMessages}
          searchTerm={searchTerm}
          onView={setSelectedMessage}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

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
                onClick={(event) => event.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#c29e6d] via-[#d4af37] to-[#047857]" />

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <div className="mb-10 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-sm">
                      <MessageCircle className="h-6 w-6 text-yellow-600" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Message Details
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailCard
                      label="Full Name"
                      value={selectedMessage.name}
                      icon={User}
                    />

                    <DetailCard
                      label="Phone Number"
                      value={selectedMessage.phone}
                      icon={Phone}
                    />

                    <DetailCard
                      label="Email Address"
                      value={selectedMessage.email}
                      icon={Mail}
                    />

                    <DetailCard
                      label="Reception Date"
                      value={
                        selectedMessage.createdAt
                          ? new Date(selectedMessage.createdAt).toLocaleString()
                          : "N/A"
                      }
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
                      type="button"
                      onClick={() => setSelectedMessage(null)}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                onClick={(event) => event.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500" />

                <button
                  type="button"
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
                      <h2 className="text-2xl font-bold text-slate-800">
                        Update Description
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                          Sender Name
                        </label>

                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500">
                          {editMessage.name || "N/A"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                          Phone Number
                        </label>

                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500">
                          {editMessage.phone || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Inquiry Content
                      </label>

                      <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 max-h-24 overflow-y-auto">
                        {editMessage.message || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Description
                      </label>

                      <textarea
                        value={description}
                        onChange={(event) =>
                          setDescription(event.target.value)
                        }
                        rows={5}
                        placeholder="Add Description"
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all outline-none"
                      />
                    </div>

                    <div className="justify-center pt-4">
                      <button
                        type="button"
                        onClick={handleUpdateDescription}
                        disabled={isUpdating}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isUpdating && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}

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