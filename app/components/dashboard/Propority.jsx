"use client";

import Image from "next/image";
import Link from "next/link";
import { properties } from "@/app/data/OverViewData";

const Property = () => {
  return (
    <div className="mt-12 md:mt-18">
      <div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#08211e]">
          Property Details
        </h2>
      </div>


      <div className="grid grid-cols-1 gap-6 mt-12 lg:grid-cols-3">
        {properties.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/proporitydetail?id=${item.id}`}
            className="cursor-pointer flex flex-col h-full rounded-2xl border border-[#ded2bf] bg-white shadow-sm hover:shadow-md overflow-hidden"
          >
            <div className="py-4">
              <h3 className="text-center text-lg font-bold text-black">
                {item.shopNo}
              </h3>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 border-t border-[#ded2bf]" />

              <div className="overflow-hidden relative w-23 h-23 z-10 bg-[#08211e] rounded-full p-3 shadow-inner border border-[#ded2bf]/30">
                <Image
                  src={item.image}
                  alt={item.shopNo}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex-1 mt-6 grid grid-cols-2 gap-y-4 p-6 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#08211e]/60">
                  Name
                </p>
                <h4 className="font-bold text-[#08211e]">{item.name}</h4>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#08211e]/60">
                  Shop No
                </p>
                <h4 className="font-bold text-[#08211e]">{item.shopNo}</h4>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#08211e]/60">
                  Floor
                </p>
                <h5 className="font-bold text-[#08211e]">{item.floor}</h5>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#08211e]/60">
                  Size
                </p>
                <h5 className="font-bold text-[#08211e]">{item.size}</h5>
              </div>
            </div>

            <div className="border-t border-[#ded2bf]/50" />

            <div className="flex justify-between items-center bg-[#ded2bf]/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#08211e]/60">
                Net Width
              </p>
              <h4 className="text-base font-black text-[#08211e]">
                {item.netWidth}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Property;