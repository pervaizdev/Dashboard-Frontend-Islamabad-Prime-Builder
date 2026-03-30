import { Megaphone } from "lucide-react";
import { announcements } from "@/app/data/OverViewData.js";

const AnnouncementsSection = () => {
  return (
    <div
      className="rounded-2xl border border-slate-100 bg-white shadow-md"
    >
      <div className="flex items-center gap-2 bg-[#08211e] px-4 py-3 text-white">
        <div className="rounded-lg bg-[#c29e6d]/20 p-2">
          <Megaphone className="h-4 w-4 text-[#c29e6d]" />
        </div>
        <h3 className="text-base font-bold tracking-tight">Recent Announcements</h3>
      </div>

      <div className="divide-y divide-slate-100">
        {announcements.map((item, index) => (
          <div
            key={index}
            className={`group relative p-4 transition-colors hover:bg-[#c29e6d]/5 ${
              item.active ? "border-l-2 border-l-[#c29e6d] bg-[#c29e6d]/5" : ""
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h4
                className={`text-sm font-semibold leading-snug ${
                  item.active ? "text-[#08211e]" : "text-slate-700"
                }`}
              >
                {item.title}
              </h4>

              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-widest ${
                  item.active ? "text-[#c29e6d]" : "text-slate-400"
                }`}
              >
                {item.date || "Notification"}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsSection;