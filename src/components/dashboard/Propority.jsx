"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, LayoutPanelLeft, Ruler, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { properties } from "@/data/OverViewData";

const PropertyTable = () => {
  return (
    <div className="mt-16 lg:mt-28">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 text-center md:text-left"
      >
        <h2 className="font-serif text-3xl font-bold tracking-tight text-charcoal md:text-5xl lg:text-6xl">
          Your <span className="text-primary">Investments</span>
        </h2>
        <div className="mt-4">
            <p className="text-sm md:text-base text-charcoal/50 font-body max-w-xl leading-relaxed">
              A professionally managed property portfolio where you can easily see real-time values and clear details anytime.
            </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="overflow-hidden rounded-[2.5rem] bg-white premium-border-glow shadow-2xl shadow-primary/5"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-charcoal text-white">
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                  <div className="flex items-center gap-2"><Building2 size={14}/> Property Shop</div>
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                  <div className="flex items-center gap-2"><LayoutPanelLeft size={14}/> Unit Type</div>
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                  <div className="flex items-center gap-2"><LayoutPanelLeft size={14}/> Floor</div>
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                   <div className="flex items-center gap-2"><Ruler size={14}/> Coverage</div>
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                   <div className="flex items-center gap-2"><Landmark size={14}/> Valuation</div>
                </th>
                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
                   Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/5 bg-white">
              {properties.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="transition-colors hover:bg-primary/[0.02] group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm p-1 transition-transform group-hover:scale-110">
                        <Image
                          src={item.image}
                          alt={item.shopNo}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-base font-bold text-charcoal">
                          {item.shopNo}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                           {item.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <span className="inline-flex items-center rounded-lg bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                       {item.unitInfo.type}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-sm font-medium text-charcoal/60 font-body">
                    {item.unitInfo.floor}
                  </td>

                  <td className="px-8 py-6 text-sm font-medium text-charcoal/60 font-body">
                    {item.unitInfo.size} sq.ft
                  </td>

                  <td className="px-8 py-6">
                    <p className="font-serif text-lg font-bold text-charcoal tracking-tight">
                        {item.paymentInfo.netWorth}
                    </p>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <Link
                      href={`/dashboard/proporitydetail?id=${item.id}`}
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
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyTable;
