"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Trash2, 
  Edit3, 
  Eye, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Maximize2
} from "lucide-react";
import Image from "next/image";
import { 
  getPropertyImages, 
  uploadPropertyImage, 
  deletePropertyImage, 
  updatePropertyImage 
} from "@/api/propertyImage";
import { toast, Toaster } from "react-hot-toast";

const PropertyImagesPage = () => {
  const [activeTab, setActiveTab] = useState("Landing Page");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const folders = {
    "Landing Page": "Islamabad_Prime_Builder/Landing_page",
    "Dashboard": "Islamabad_Prime_Builder/Dashboard"
  };

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const folder = folders[activeTab];
      const response = await getPropertyImages(folder);
      if (response.success) {
        setImages(response.data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("description", description);

      const isLanding = activeTab === "Landing Page";
      const response = await uploadPropertyImage(formData, folders[activeTab], isLanding);

      if (response.success) {
        toast.success("Uploaded successfully!");
        setIsUploadModalOpen(false);
        resetForm();
        fetchImages();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await deletePropertyImage(itemToDelete);
      if (response.success) {
        toast.success("Deleted successfully");
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        fetchImages();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updatePropertyImage(selectedItem._id, { title, description });
      if (response.success) {
        toast.success("Updated successfully");
        setIsEditModalOpen(false);
        fetchImages();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setSelectedItem(null);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setIsEditModalOpen(true);
  };

  const isVideo = (url) => {
    return url.match(/\.(mp4|mov|avi|webm)$|video/i);
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-10 text-[#0d2d29]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#c29e6d] mb-2">Property Media</h1>
          <p className="text-[#0d2d29]/60 font-medium">Manage your landing page and dashboard visuals</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setIsUploadModalOpen(true); }}
          className="flex items-center gap-2 bg-[#c29e6d] hover:bg-[#b08d5c] text-[#08211e] px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#c29e6d]/20 active:scale-95 text-sm uppercase tracking-wider"
        >
          <Plus size={20} />
          Upload New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[#c29e6d]/10 pb-4">
        {Object.keys(folders).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === tab ? "text-[#c29e6d]" : "text-[#0d2d29]/40 hover:text-[#0d2d29]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-[-16px] left-0 right-0 h-1 bg-[#c29e6d] rounded-full shadow-[0_0_10px_rgba(194,158,109,0.5)]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#c29e6d]" size={48} />
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {images.length > 0 ? images.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-[#fdfaf5] border border-[#c29e6d]/20 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-xl hover:border-[#c29e6d]/40"
              >
                <div className="relative aspect-video bg-black/40 flex items-center justify-center overflow-hidden">
                  {isVideo(item.url) ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <Image 
                      src={item.url} 
                      alt={item.title || "Property image"} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#08211e]/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                    <button 
                      onClick={() => window.open(item.url, "_blank")}
                      className="p-3 bg-white/10 hover:bg-[#c29e6d] hover:text-[#08211e] rounded-full transition-all"
                      title="View Full"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-3 bg-white/10 hover:bg-[#c29e6d] hover:text-[#08211e] rounded-full transition-all"
                      title="Edit"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item._id)}
                      className="p-3 bg-white/10 hover:bg-red-500 hover:text-white rounded-full transition-all"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Icon Indicator */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10 pointer-events-none">
                    {isVideo(item.url) ? <Video size={14} className="text-[#c29e6d]" /> : <ImageIcon size={14} className="text-[#c29e6d]" />}
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-[#0d2d29] truncate">{item.title || "Untitled"}</h3>
                  <p className="text-[#0d2d29]/40 text-xs truncate mt-1">{item.description || "No description"}</p>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-[#0d2d29]/40 border-2 border-dashed border-[#c29e6d]/20 rounded-2xl bg-[#fdfaf5]">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No media found in this folder</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-[#0d2d29]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white border border-[#c29e6d]/30 rounded-[2rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#c29e6d]">Upload {activeTab} Media</h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-[#0d2d29]/40 hover:text-[#0d2d29] transition-colors">
                  <X />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c29e6d]">Media File</label>
                  <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#c29e6d]/20 rounded-2xl cursor-pointer hover:border-[#c29e6d]/40 transition-all bg-[#fdfaf5]">
                    {previewUrl ? (
                      <div className="relative w-full h-full p-2">
                        {file?.type.startsWith("video") ? (
                          <video src={previewUrl} className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <img src={previewUrl} className="w-full h-full object-contain rounded-lg" />
                        )}
                        <button 
                          onClick={(e) => { e.preventDefault(); resetForm(); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload size={32} className="text-[#c29e6d] opacity-50 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-[#0d2d29]/60">Drop your file here or click to browse</p>
                        <p className="text-[10px] text-[#c29e6d]/60 uppercase font-bold tracking-tighter">Images & Videos supported</p>
                      </div>
                    )}
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c29e6d]">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter media title..."
                    className="w-full bg-[#fdfaf5] border border-[#c29e6d]/20 text-[#0d2d29] rounded-xl px-4 py-3 focus:outline-none focus:border-[#c29e6d] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c29e6d]">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description (optional)..."
                    rows={3}
                    className="w-full bg-[#fdfaf5] border border-[#c29e6d]/20 text-[#0d2d29] rounded-xl px-4 py-3 focus:outline-none focus:border-[#c29e6d] transition-colors resize-none"
                  />
                </div>

                <button 
                  disabled={uploading || !file}
                  className="w-full bg-[#c29e6d] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b08d5c] text-[#08211e] py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Uploading Media...
                    </span>
                  ) : "Begin Upload"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-[#0d2d29]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-[#c29e6d]/30 rounded-[2rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#c29e6d]">Update Media Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-[#0d2d29]/40 hover:text-[#0d2d29] transition-colors">
                  <X />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c29e6d]">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter media title..."
                    className="w-full bg-[#fdfaf5] border border-[#c29e6d]/20 text-[#0d2d29] rounded-xl px-4 py-3 focus:outline-none focus:border-[#c29e6d] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c29e6d]">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description..."
                    rows={4}
                    className="w-full bg-[#fdfaf5] border border-[#c29e6d]/20 text-[#0d2d29] rounded-xl px-4 py-3 focus:outline-none focus:border-[#c29e6d] transition-colors resize-none"
                  />
                </div>

                <button 
                  className="w-full bg-[#c29e6d] hover:bg-[#b08d5c] text-[#08211e] py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-[#0d2d29]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-red-500/20 rounded-[2rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 rounded-full text-red-500">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Confirm Deletion</h3>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
                Are you sure you want to delete this item? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shimmer-gold {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-gold {
          background: linear-gradient(90deg, #c29e6d 0%, #ecd0a5 50%, #c29e6d 100%);
          background-size: 200% 100%;
          animation: shimmer-gold 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default PropertyImagesPage;
