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
    <div className="mt-16 lg:mt-28 w-full px-5 lg:pb-9">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-3xl font-bold tracking-tight text-charcoal md:text-5xl lg:text-6xl">
          Your <span className="text-primary">Investments</span>
        </h2>
        <div className="mt-4">
          <p className="text-sm md:text-base text-charcoal/50 font-body max-w-xl mx-auto md:mx-0 leading-relaxed">
            A professionally managed property portfolio where you can easily see
            real-time values and clear details anytime.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="w-full overflow-hidden rounded-[2.5rem] bg-white premium-border-glow shadow-2xl shadow-primary/5"
      >
        {/* Mobile View (Cards) */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {properties.length > 0 ? (
            properties.map((item, index) => (
              <motion.div
                key={`mobile-${item._id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-slate-50/50 p-5 shadow-sm"
              >
                <div className="flex items-center gap-4 border-b border-primary/5 pb-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm p-1">
                    <Image
                      src={"/images/logo.png"}
                      alt={item.property_number}
                      fill
                      sizes="56px"
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-lg font-bold text-charcoal leading-tight">
                      {item.property_number}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mt-1">
                      {item.building_name}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
                    {item.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
                      <LayoutPanelLeft size={12} /> Floor
                    </p>
                    <p className="text-sm font-medium text-charcoal/80 font-body">
                      {item.floor}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
                      <Ruler size={12} /> Coverage
                    </p>
                    <p className="text-sm font-medium text-charcoal/80 font-body">
                      {item.size}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-primary/5">
                  <Link
                    href={`/dashboard/proporitydetail?id=${item.property_id}`}
                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-charcoal shadow-lg hover:shadow-primary/20"
                  >
                    Explore Property
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="p-8 text-center text-charcoal/40 font-medium">
              No properties found
            </p>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto w-full">
          {properties.length > 0 ? (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-charcoal text-white">
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} /> Property & Building
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <LayoutPanelLeft size={14} /> Type
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <LayoutPanelLeft size={14} /> Floor
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Ruler size={14} /> Size
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Ruler size={14} /> Status
                    </div>
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 whitespace-nowrap">
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
                      <div className="flex items-center gap-4">
                       
                        <div>
                          <p className="text-center font-serif text-base font-bold text-charcoal">
                            {item.property_number}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                         ${item.property_owned_status === "Owned"
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
                      <Link
                        href={`/dashboard/proporitydetail?id=${item.property_id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-charcoal hover:shadow-lg hover:shadow-primary/20"
                      >
                        Explore
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
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
