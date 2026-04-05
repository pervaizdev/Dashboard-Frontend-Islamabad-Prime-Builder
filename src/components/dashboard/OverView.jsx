import PaymentCard from "@/components/dashboard/PaymentCard.jsx";
import Announcement from "@/components/dashboard/Announcement.jsx";
import Propority from "@/components/dashboard/Propority.jsx";
import Gallery from "@/components/dashboard/Gallery.jsx";

const OverView = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-10">
        <div className="lg:col-span-2">
          <PaymentCard />
        </div>
        <div className="lg:col-span-1">
          <Announcement />
        </div>
      </div>
      <Propority />
      <Gallery />
    </>
  );
};

export default OverView;
