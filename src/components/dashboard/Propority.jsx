"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  LayoutPanelLeft,
  Ruler,
  Landmark,
  Loader2,
  MapPin,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { propertyAPI } from "@/api/property";

const PropertyTable = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyAPI.getMyProperties();
        if (data?.success) {
          setProperties(data.properties || []);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-10 sm:mt-16 lg:mt-28 w-full px-3 sm:px-5 lg:pb-9">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 sm:mb-10 text-center"
      >
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#123D32] md:text-5xl lg:text-6xl">
          Your <span className="text-primary">Investments</span>
        </h2>
        <div className="mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm md:text-base text-charcoal/50 font-body max-w-xl mx-auto leading-relaxed px-2">
            A professionally managed property portfolio where you can easily see
            real-time values and clear details anytime.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white premium-border-glow shadow-2xl shadow-primary/5"
      >
        {/* Mobile View (Cards) — shown on xs/sm screens */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
          {properties.length > 0 ? (
            properties.map((item, index) => (
              <motion.div
                key={`mobile-${item._id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex flex-col gap-0 rounded-2xl border border-primary/10 bg-slate-50/60 overflow-hidden shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 bg-[#123D32]/5 px-4 py-3 border-b border-primary/10">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border border-primary/10 bg-primary/5">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base font-bold text-charcoal leading-tight truncate">
                      {item.property_number}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mt-0.5 truncate">
                      {item.building_name}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-[9px] font-bold text-primary uppercase tracking-wider shrink-0 whitespace-nowrap">
                    {item.type}
                  </span>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-2 gap-0 divide-x divide-primary/10">
                  <div className="px-4 py-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary/50 mb-1">
                      Floor
                    </p>
                    <p className="text-sm font-semibold text-charcoal/80 font-body">
                      {item.floor}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary/50 mb-1">
                      Size
                    </p>
                    <p className="text-sm font-semibold text-charcoal/80 font-body">
                      {item.size}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10 bg-white">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      item.property_owned_status === "Owned"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.property_owned_status === "Owned" ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <RefreshCw size={10} />
                    )}
                    {item.property_owned_status === "Owned"
                      ? "Owned"
                      : "Transferred"}
                  </span>

                  {/* Action Button */}
                  {item.property_owned_status !== "Transferred" && (
                    <Link
                      href={`/dashboard/proporitydetail?id=${item.property_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#123D32] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0"
                    >
                      Explore
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="p-8 text-center text-charcoal/40 font-medium">
              No properties found
            </p>
          )}
        </div>

        {/* Desktop View (Table) — shown on md+ screens */}
        <div className="hidden md:block overflow-x-auto w-full">
          {properties.length > 0 ? (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#123D32] text-white">
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5C476] whitespace-nowrap">
                    Property &amp; Building
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5C476] whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5C476] whitespace-nowrap">
                    Floor
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5C476] whitespace-nowrap">
                    Size
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5C476] whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5C476] whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-primary/5 bg-white">
                {properties.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="transition-colors hover:bg-primary/2 group"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center ">
                          <Building2 size={28} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-serif text-base font-bold text-charcoal leading-tight">
                            {item.property_number}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mt-0.5">
                            {item.building_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-lg bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                        {item.type}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-sm font-medium text-charcoal/60 font-body whitespace-nowrap">
                      {item.floor}
                    </td>

                    <td className="px-8 py-6 text-sm font-medium text-charcoal/60 font-body whitespace-nowrap">
                      {item.size}
                    </td>

                    <td className="px-8 py-6 text-sm font-medium whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.property_owned_status === "Owned"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.property_owned_status === "Owned"
                          ? "Owned"
                          : "Transferred"}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      {item.property_owned_status !== "Transferred" && (
                        <Link
                          href={`/dashboard/proporitydetail?id=${item.property_id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#123D32] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#E5C476] shadow-[0_6px_16px_rgba(18,61,50,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#0C3027] hover:shadow-[0_9px_22px_rgba(18,61,50,0.25)] active:translate-y-0"
                        >
                          Explore
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-12 text-center text-charcoal/40 font-medium">
              No properties yet.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyTable;
