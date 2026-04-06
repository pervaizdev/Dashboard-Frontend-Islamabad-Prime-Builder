import OverView from "@/components/dashboard/OverView.jsx";

const DashboardPage = () => {
  return (
    <div className="w-full bg-slate-50 px-4 py-6 md:px-8 lg:px-12 text-black min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        <OverView />
      </div>
    </div>
  );
};

export default DashboardPage;