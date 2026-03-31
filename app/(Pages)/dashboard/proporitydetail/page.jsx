"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { properties } from "@/app/data/OverViewData";

const PropertyDetailContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const property = properties.find((item) => item.id === Number(id));

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf9f6]">
        <h2 className="text-2xl font-bold text-[#08211e] mb-4">Property Not Found</h2>
        <Link href="/dashboard">
          <button className="bg-[#c29e6d] text-white px-6 py-2 rounded-full font-bold">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 lg:px-16 bg-[#faf9f6] min-h-screen">
      <div className="flex items-center text-gray-200 border rounded-2xl p-4 justify-between mb-10">
        <h1 className="text-4xl font-bold text-[#08211e]">
          Property Detail
        </h1>
        <Link href="/dashboard" >
        <button className="bg-[#e3cfac] cursor-pointer text-black px-5 py-3 rounded-full font-bold" >Back to Dashboard</button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Div: Payment Details */}
        <div className="rounded-3xl border border-[#c29e6d]/30 bg-white p-8 shadow-sm hover:shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#c29e6d] rounded-full" />
            <h2 className="text-2xl font-bold text-[#08211e]">
              Payment Metrics
            </h2>
          </div>

          <div className="space-y-5">
            {[
              { label: "Total Contract Value", value: property.total },
              { label: "Amount Paid to Date", value: property.paid },
              { label: "Outstanding Balance", value: property.remainingAmount, highlight: true },
              { label: "Installments Remaining", value: property.remainingInstallment },
            ].map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center pb-4 ${idx !== 3 ? "border-b border-[#c29e6d]/10" : ""}`}>
                <span className="font-medium text-[#08211e]/60 text-sm uppercase tracking-wider">{item.label}</span>
                <span className={`text-lg font-bold ${item.highlight ? "text-[#c29e6d]" : "text-[#08211e]"}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Div: Shop Details */}
        <div className="rounded-3xl border border-[#c29e6d]/30 bg-white p-8 shadow-sm hover:shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#08211e] rounded-full" />
            <h2 className="text-2xl font-bold text-[#08211e]">
              Unit Specifications
            </h2>
          </div>

          <div className="space-y-5">
            {[
              { label: "Unit Number", value: property.shopNo },
              { label: "Floor Level", value: property.floor },
              { label: "Total Surface Area", value: property.size },
            ].map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center pb-4 ${idx !== 2 ? "border-b border-[#c29e6d]/10" : ""}`}>
                <span className="font-medium text-[#08211e]/60 text-sm uppercase tracking-wider">{item.label}</span>
                <span className="text-lg font-bold text-[#08211e]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-[#08211e] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[#c29e6d] font-bold uppercase text-xs mb-1">Initial Commitment</p>
            <h2 className="text-3xl font-medium font-black">
              Down Payment: <span className="font-bold text-[#c29e6d]">{property.downPayment}</span>
            </h2>
          </div>
          <button className="bg-[#c29e6d] hover:bg-[#b58e5a] text-[#08211e] px-8 py-3 rounded-2xl font-bold shadow-lg">
            Payment History Details
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold text-[#08211e] mb-6 flex items-center gap-2">
            Installment Schedule
        </h3>
        
        <div className="overflow-hidden rounded-3xl border border-[#c29e6d]/20 bg-white shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#08211e] text-[#c29e6d]">
              <tr>
                <th className="px-8 py-5 text-sm uppercase">Billing Month</th>
                <th className="px-8 py-5 text-sm uppercase">Installment</th>
                <th className="px-8 py-5 text-sm uppercase text-center">Payment Status</th>
                <th className="px-8 py-5 text-sm uppercase text-right">Certificate</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c29e6d]/10">
              {property.installments.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50">
                  <td className="px-8 py-5 font-bold text-[#08211e]">{item.month}</td>
                  <td className="px-8 py-5 font-medium text-slate-600">{item.installment}</td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                        item.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="group inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-[#08211e] text-xs font-bold hover:bg-[#08211e] hover:text-white">
                      Download
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c29e6d] group-hover:bg-white" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PropertyDetailPage = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#faf9f6]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c29e6d]"></div>
        </div>
      }>
        <PropertyDetailContent />
      </Suspense>
    );
  };
  
export default PropertyDetailPage;