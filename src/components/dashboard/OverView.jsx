"use client";
import PaymentCard from "@/components/dashboard/PaymentCard.jsx";
import Announcement from "@/components/dashboard/Announcement.jsx";
import Propority from "@/components/dashboard/Propority.jsx";
import Gallery from "@/components/dashboard/Gallery.jsx";
import Admin_due_payment from "./Admin_due_payment";



const OverView = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-4 px-5 ">
        <div className="lg:col-span-2">
          <PaymentCard />
        </div>
        <div className="lg:col-span-1">
          <Announcement />
        </div>
      </div>
      <Propority />
      <Admin_due_payment />
      <Gallery />
    </>
  );
};


export default OverView;
