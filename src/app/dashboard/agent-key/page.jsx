"use client";

import React, { useState, useEffect } from "react";
import { Key, Loader2 } from "lucide-react";
import { agentKeyAPI } from "@/api/agentKey";
import toast from "react-hot-toast";

export default function AgentKeyPage() {
  const [formData, setFormData] = useState({
    field1: "",
    field2: "",
    field3: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await agentKeyAPI.getAgentKeys();
        if (response.success && response.data) {
          setFormData({
            field1: response.data.field1 || "",
            field2: response.data.field2 || "",
            field3: response.data.field3 || "",
          });
        }
      } catch (error) {
        toast.error(error.message || "Failed to load agent keys");
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await agentKeyAPI.updateAgentKeys(formData);
      if (response.success) {
        toast.success(response.message || "Agent keys saved successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save agent keys");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#123D32]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8 container mx-auto">
      <div className="overflow-hidden rounded-[26px] border border-[#123D32]/10 bg-white shadow-[0_12px_35px_rgba(18,61,50,0.08)]">
       

        <form onSubmit={handleSubmit} className="px-5 py-8 sm:px-8 space-y-6">
          {/* Input 1 */}
          <div>
            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
              Key Field 1
            </label>
            <input
              type="text"
              name="field1"
              value={formData.field1}
              onChange={handleChange}
              placeholder="Enter value 1"
              className="h-[47px] w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
            />
          </div>

          {/* Input 2 */}
          <div>
            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
              Key Field 2
            </label>
            <input
              type="text"
              name="field2"
              value={formData.field2}
              onChange={handleChange}
              placeholder="Enter value 2"
              className="h-[47px] w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
            />
          </div>

          {/* Input 3 */}
          <div>
            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">
              Key Field 3
            </label>
            <input
              type="text"
              name="field3"
              value={formData.field3}
              onChange={handleChange}
              placeholder="Enter value 3"
              className="h-[47px] w-full rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-4 text-xs font-semibold text-[#123D32] outline-none transition-all duration-200 hover:border-[#C6A15B]/50 hover:bg-white focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-[42px] cursor-pointer rounded-xl bg-[#123D32] px-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Keys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
