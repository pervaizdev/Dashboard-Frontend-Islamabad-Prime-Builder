"use client";

import { useState } from "react";
import { announcementAPI } from "@/api/annoucement";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function AnnouncementPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.start_datetime || !formData.end_datetime) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await announcementAPI.createAnnouncement(formData);
      if (response.success) {
        toast.success("Announcement added successfully!");
        setFormData({
          title: "",
          description: "",
          start_datetime: "",
          end_datetime: ""
        });
      } else {
        toast.error(response.message || "Failed to add announcement");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl lg:py-10 mt-12 lg:mt-0 px-4 lg:px-0">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-800">
            Add Announcement
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new announcement with details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter description"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 transition-all"
            ></textarea>
          </div>

          {/* Start DateTime */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 transition-all"
            />
          </div>

          {/* End DateTime */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 transition-all"
            />
          </div>

          {/* Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Adding..." : "Add Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}