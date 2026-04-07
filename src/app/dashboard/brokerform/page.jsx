"use client";

import { useState } from "react";
import { brokersAPI } from "@/api/brokers";
import toast from "react-hot-toast";
import { Loader2, UserPlus, Phone, CreditCard, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BrokerFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    address: ""
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
    setLoading(true);

    try {
      const response = await brokersAPI.createBroker(formData);
      if (response.success) {
        toast.success("Broker added successfully!");
        setFormData({
          name: "",
          cnic: "",
          phone: "",
          address: ""
        });
        // Optional: redirect to a brokers list page
        // router.push("/dashboard/brokers");
      } else {
        toast.error(response.message || "Failed to add broker");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 px-6 py-8 sm:px-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
              <UserPlus className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Add New Broker
              </h1>
              <p className="mt-1 text-slate-400 text-sm">
                Register a new broker to the management system.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Broker Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Broker Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Mati"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* CNIC Number */}
            <div className="space-y-2">
              <label htmlFor="cnic" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                CNIC Number
              </label>
              <input
                id="cnic"
                name="cnic"
                type="text"
                required
                value={formData.cnic}
                onChange={handleChange}
                placeholder="71301-6445487-2"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="03001234567"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Residential Address
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Top city gom bare"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              {loading ? "Registering..." : "Add Broker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
