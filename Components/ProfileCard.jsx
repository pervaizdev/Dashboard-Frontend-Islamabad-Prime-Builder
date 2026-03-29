"use client";

import { motion } from "framer-motion";
import { Megaphone, Wallet, CircleDollarSign, CreditCard, BadgeDollarSign } from "lucide-react";

const stats = [
  {
    title: "Total Payment",
    value: "$12,000",
    icon: Wallet,
    valueClass: "text-[#0b2242]",
    iconBg: "bg-[#eef4ff]",
    iconColor: "text-[#3b82f6]",
  },
  {
    title: "Paid Amount",
    value: "$12,000",
    icon: CreditCard,
    valueClass: "text-[#0b2242]",
    iconBg: "bg-[#eefcf3]",
    iconColor: "text-[#22c55e]",
  },
  {
    title: "Received Amount",
    value: "$12,000",
    icon: CircleDollarSign,
    valueClass: "text-[#22c55e]",
    iconBg: "bg-[#eefcf3]",
    iconColor: "text-[#22c55e]",
  },
  {
    title: "Remaining Amount",
    value: "$0.00",
    icon: BadgeDollarSign,
    valueClass: "text-[#4ade80]",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#22c55e]",
  },
];

const announcements = [
  {
    title: "Happy Birthday, Muhammad Huzaifa!",
    text: "Wishing Muhammad Huzaifa a wonderful birthday today! 🎉",
    date: "26 Mar",
    active: true,
  },
  {
    title: "Launching Soon! ViSole Digital Office",
    text: "ViSole Digital Office is scheduled for launch soon! We eagerly welcome your feedback and input to ensure success and completion...",
    date: "19 Mar",
  },
  {
    title: "Eid-ul-Fitr Holidays Announcement",
    text: "Eid-ul-Fitr holidays will be observed from 20th March to 23rd March. Regular working operations will resume from 24th March...",
    date: "19 Mar",
  },
];

const ProfileCard = ({ profile }) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-3 border-b border-[#c29e6d]/30 p-5 pb-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#08211e]">
              Welcome back, {profile?.name || "Client User"}
            </h2>
            <p className="text-sm text-slate-500">
              Logged in as: {profile?.email || "client@example.com"}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c29e6d]/30 bg-white px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-600">Online</span>
          </div>
        </div>
      </motion.div>

      {/* First Div */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-[#c29e6d]/20 bg-white p-5 shadow-sm"
      >
        <div className="mb-5">
          <h3 className="text-xl font-bold text-[#08211e]">Overall Overview</h3>
          <p className="text-sm text-slate-500">
            Payment summary of your shop or room
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + index * 0.08 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {item.title}
                    </p>
                    <h4 className={`mt-3 text-3xl font-bold ${item.valueClass}`}>
                      {item.value}
                    </h4>
                  </div>

                  <div className={`rounded-xl p-3 ${item.iconBg}`}>
                    <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Second Div */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-[#c29e6d]/20 bg-white shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <Megaphone className="h-5 w-5 text-orange-500" />
          <h3 className="text-xl font-bold uppercase tracking-wide text-[#0b2242]">
            Announcements
          </h3>
        </div>

        <div className="min-h-[320px]">
          {announcements.map((item, index) => (
            <div
              key={index}
              className={`border-b border-slate-200 px-5 py-4 ${
                item.active ? "border-l-4 border-l-pink-500 bg-pink-50/70" : "bg-white"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <h4
                  className={`text-lg font-semibold ${
                    item.active ? "text-pink-600" : "text-[#1e293b]"
                  }`}
                >
                  {item.title}
                </h4>
                <span className="shrink-0 text-sm font-medium text-slate-400">
                  {item.date}
                </span>
              </div>

              <p className="max-w-[95%] text-base leading-7 text-slate-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCard;