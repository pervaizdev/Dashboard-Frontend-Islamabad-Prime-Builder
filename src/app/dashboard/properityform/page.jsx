"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PropertySection from "@/components/properityform/Propertysection";
import OwnerSection from "@/components/properityform/OwnerSection";
import BrokerSection from "@/components/properityform/BrokerSection";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

function PropertyFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const isEdit = !!propertyId;

  const [formData, setFormData] = useState({
    type: "",
    property_number: "",
    building_name: "",
    category: "",
    floor: "",
    size: "",
    total_price: "",
    down_payment: "",
    payment_plan: "",
    startDate: "",
    broker_commission: "",
    owners: [
      {
        userId: "",
        client_father_name: "",
        client_residential_address: "",
        client_permanent_address: "",
        occupation: "",
        age: "",
        client_cnic: "",
        nationality: "Pakistani",
      },
    ],
    brokers: [
      {
        broker_id: "",
        userId: "",
        relationship: "",
      },
    ],
  });

  const [usersList, setUsersList] = useState([]);
  const [brokersList, setBrokersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [usersRes, brokersRes] = await Promise.all([
          axiosInstance.get("/users/names"),
          axiosInstance.get("/brokers/names"),
        ]);
        if (usersRes.data.success) setUsersList(usersRes.data.users);
        if (brokersRes.data.success) setBrokersList(brokersRes.data.brokers);
      } catch (error) {
        console.error("Error fetching options:", error);
        toast.error("Failed to load user or broker lists");
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchProperty = async () => {
        try {
          setFetching(true);
          const res = await axiosInstance.get(`/property-details/${propertyId}`);
          if (res.data.success) {
            const p = res.data.property;
            setFormData({
              ...p,
              startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : "",
              broker_commission: p.brokers?.[0]?.broker_commission || ""
            });
          }
        } catch (error) {
          toast.error("Failed to load property details");
        } finally {
          setFetching(false);
        }
      };
      fetchProperty();
    }
  }, [isEdit, propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        total_price: Number(formData.total_price),
        down_payment: Number(formData.down_payment),
        owners: formData.owners.map(o => ({ ...o, age: Number(o.age), userId: Number(o.userId) })),
        brokers: formData.brokers.map(b => ({ 
          ...b, 
          broker_id: Number(b.broker_id), 
          userId: Number(b.userId),
          broker_commission: Number(formData.broker_commission) > 0 ? Number(formData.broker_commission) : 0
        }))
      };

      let response;
      if (isEdit) {
        response = await axiosInstance.put(`/property-details/${propertyId}`, payload);
      } else {
        response = await axiosInstance.post("/property-details", payload);
      }

      if (response.data.success) {
        toast.success(isEdit ? "Property updated successfully!" : "Property created successfully!");
        router.push("/dashboard/propertylist");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-10">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            {isEdit ? "Update Property" : "Property Form"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isEdit ? `Editing property #${propertyId}` : "Enter property, owner, and broker details below."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 sm:px-8">
          <PropertySection formData={formData} setFormData={setFormData} isEdit={isEdit} />
          <OwnerSection 
            formData={formData} 
            setFormData={setFormData} 
            usersList={usersList} 
          />
          <BrokerSection 
            formData={formData} 
            setFormData={setFormData} 
            brokersList={brokersList} 
            usersList={usersList}
          />

          <div className="flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update Property" : "Submit Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PropertyFormPage() {
  return (
    <Suspense fallback={
       <div className="flex h-screen items-center justify-center">
         <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
       </div>
    }>
      <PropertyFormContent />
    </Suspense>
  );
}