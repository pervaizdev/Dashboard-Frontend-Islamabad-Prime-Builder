import SideNavbar from "@/app/components/dashboard/SideNavbar";
import TopNavbar from "@/app/components/dashboard/TopNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-white">
      <SideNavbar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar />

        <div className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
}