"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  BadgeDollarSign,
  CreditCard,
  Building2,
  Layers3,
  Ruler,
  CheckCircle2,
  Clock3,
  Download,
  Landmark,
  ReceiptText,
  ShieldCheck,
  CircleDollarSign,
  Loader2,
  User,
  Users,
  Briefcase,
  Phone,
  MapPin,
  Tag,
  CheckCircle,
  X,
  CalendarDays,
  BadgeCheck,
  Eye,
  Edit2,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { propertyAPI } from "@/api/property";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// --- Custom Modal Component ---
const TransferModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [formData, setFormData] = useState({
    newOwnerName: "",
    newOwnerCNIC: "",
    newOwnerPhone: "",
    temporaryAddress: "",
    permanentAddress: ""
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute h-[100vh] inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl premium-border-glow"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-charcoal/20 hover:bg-slate-50 hover:text-charcoal transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8 items-start">
            <h3 className="font-serif text-2xl font-bold text-charcoal">Property Transfer</h3>
            <p className="mt-2 text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">
              Assign this portfolio entry to a new owner
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 px-1">Full Name *</label>
                <input
                  required
                  placeholder="New Owner Name"
                  className="w-full h-12 rounded-xl bg-slate-50 border border-primary/5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                  value={formData.newOwnerName}
                  onChange={e => setFormData({ ...formData, newOwnerName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 px-1">CNIC Number *</label>
                <input
                  required
                  placeholder="00000-0000000-0"
                  className="w-full h-12 rounded-xl bg-slate-50 border border-primary/5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                  value={formData.newOwnerCNIC}
                  onChange={e => setFormData({ ...formData, newOwnerCNIC: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 px-1">Phone Number *</label>
              <input
                required
                placeholder="+92 000 0000000"
                className="w-full h-12 rounded-xl bg-slate-50 border border-primary/5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                value={formData.newOwnerPhone}
                onChange={e => setFormData({ ...formData, newOwnerPhone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 px-1">Temporary Address (Optional)</label>
              <input
                placeholder="Street address, City"
                className="w-full h-12 rounded-xl bg-slate-50 border border-primary/5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                value={formData.temporaryAddress}
                onChange={e => setFormData({ ...formData, temporaryAddress: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30 px-1">Permanent Address (Optional)</label>
              <input
                placeholder="Village, Tehsil, District"
                className="w-full h-12 rounded-xl bg-slate-50 border border-primary/5 px-4 text-xs font-bold outline-none focus:border-primary transition-all"
                value={formData.permanentAddress}
                onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-2xl bg-charcoal py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-primary shadow-xl shadow-charcoal/10 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={16} />}
                Confirm Transfer
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const PaymentModal = ({ isOpen, onClose, onConfirm, installment, loading }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setReceiptImage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl premium-border-glow"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-charcoal/20 hover:bg-slate-50 hover:text-charcoal transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-600/10">
              <BadgeDollarSign size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal">Record Payment</h3>
            <p className="mt-2 text-sm text-charcoal/40 font-medium uppercase tracking-widest">
              {installment?.monthYear} • Rs. {installment?.amount?.toLocaleString()}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/30 px-1">
                Transaction Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-primary/10 bg-slate-50 pl-12 pr-4 text-sm font-bold text-charcoal outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/30 px-1">
                Payment Receipt (Optional)
              </label>
              <div className="relative h-14 w-full group">
                <div className="absolute inset-0 rounded-2xl border border-primary/10 bg-slate-50 flex items-center px-4 transition-all group-hover:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/5">
                  <Download className="text-primary mr-4" size={18} />
                  <span className="text-xs font-bold text-charcoal/60 truncate pr-4">
                    {receiptImage ? receiptImage.name : "Select Receipt Image"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptImage(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={loading}
                onClick={() => onConfirm(date, receiptImage)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-charcoal py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-primary shadow-xl shadow-charcoal/10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Finalize Record
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const PropertyDetailContent = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedInstIndex, setSelectedInstIndex] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const [isEditingPaidDP, setIsEditingPaidDP] = useState(false);
  const [newPaidDP, setNewPaidDP] = useState("");
  const [updatingPaidDP, setUpdatingPaidDP] = useState(false);

  const handleUpdatePaidDP = async () => {
    try {
      const val = Number(newPaidDP);
      if (val > propertyData.down_payment) {
        toast.error("Paid down payment cannot be greater than total down payment");
        return;
      }
      setUpdatingPaidDP(true);
      const res = await propertyAPI.updateProperty(id, { paid_downpayment: val });
      if (res.success) {
        toast.success("Paid down payment updated!");
        setIsEditingPaidDP(false);
        fetchDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update paid down payment");
    } finally {
      setUpdatingPaidDP(false);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isSuperAdmin = user?.role === "super-admin";

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await propertyAPI.getPropertyDetails(id);
      if (res.success) {
        setPropertyData(res.property);
      }
    } catch (error) {
      console.error("Failed to fetch property details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleMarkAsPaidPress = (index) => {
    setSelectedInstIndex(index);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (paidDate, receiptImage) => {
    try {
      setUpdatingId(selectedInstIndex);

      const formData = new FormData();
      formData.append("status", "paid");
      formData.append("paidDate", paidDate || new Date().toISOString());

      if (receiptImage) {
        formData.append("receiptImage", receiptImage);
      }

      // We pass "Islamabad_Prime_Builder/Installement" as the 4th argument to help the backend/cloudinary utility
      const res = await propertyAPI.updateInstallmentStatus(
        id,
        selectedInstIndex,
        formData,
        "Islamabad_Prime_Builder/Installement"
      );

      if (res.success) {
        toast.success("Installment marked as paid!");
        setIsModalOpen(false);
        fetchDetails(); // Refresh data
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTransferProperty = async (formData) => {
    try {
      setIsTransferring(true);
      const res = await propertyAPI.transferProperty(id, formData);
      if (res.success) {
        toast.success("Property ownership transferred!");
        setIsTransferModalOpen(false);
        fetchDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading && !propertyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen section-gradient flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-[2.5rem] p-12 text-center premium-border-glow max-w-lg shadow-2xl"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Landmark size={40} className="text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
            Property Not Found
          </h1>
          <p className="font-body text-charcoal/50 mb-8">
            The requested estate details could not be retrieved from our private portfolio.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 rounded-xl bg-charcoal px-10 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary transition-all shadow-xl shadow-charcoal/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-10 lg:px-16 space-y-10">

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
        installment={propertyData.installments[selectedInstIndex]}
        loading={updatingId !== null}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={handleTransferProperty}
        loading={isTransferring}
      />

      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col gap-6 rounded-[2.5rem] glass p-8 premium-border-glow md:flex-row md:items-center md:justify-between shadow-2xl shadow-primary/5"
      >
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-charcoal lg:text-4xl">
            {propertyData.property_number}
          </h1>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-charcoal text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-all shadow-xl shadow-charcoal/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* Unit Information */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass rounded-[2rem] p-5 premium-border-glow shadow-xl"
        >
          <div className="mb-6 flex items-center gap-4 border-b border-primary/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-charcoal">
                Property Details
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Basic Information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: Building2, label: propertyData?.type, value: propertyData?.property_number },
              { icon: Layers3, label: "Floor Elevation", value: propertyData?.floor },
              { icon: Ruler, label: "Area", value: propertyData?.size },
              { icon: ShieldCheck, label: "Type", value: propertyData?.type },
              { icon: MapPin, label: "Building Name", value: propertyData?.building_name },
              { icon: Tag, label: "Category", value: propertyData?.category },
            ].map((item, idx) => (
              <div key={idx} className="group rounded-2xl border border-primary/5 bg-white/40 p-5 transition-all hover:bg-primary/5 hover:border-primary/20">
                <div className="mb-3 flex items-center gap-2 text-primary/40 group-hover:text-primary transition-colors">
                  <item.icon className="h-4 w-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em]">
                    {item.label}
                  </p>
                </div>
                <h4 className="font-serif text-md font-semibold text-charcoal group-hover:translate-x-1 transition-transform">
                  {item.value}
                </h4>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment overview */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass rounded-[2rem] p-5 premium-border-glow shadow-xl bg-charcoal/5"
        >
          <div className="mb-6 flex items-center gap-4 border-b border-primary/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal text-primary shadow-lg ring-1 ring-primary/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-charcoal group-hover:text-primary">
                Financial Portfolio
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Asset Valuation</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Property Price", value: `Rs. ${propertyData.total_price?.toLocaleString()}` },
              {
                label: "Down Payment",
                value:
                  propertyData.paid_downpayment > 0 &&
                    propertyData.paid_downpayment !== propertyData.down_payment
                    ? `Rs. ${propertyData.down_payment?.toLocaleString()} / Rs. ${propertyData.paid_downpayment.toLocaleString()}`
                    : `Rs. ${propertyData.down_payment?.toLocaleString()}`
              },
              {
                label: "Paid Payment",
                value: `Rs. ${propertyData.paid_downpayment === propertyData.down_payment
                  ? propertyData.paid_payment?.toLocaleString()
                  : propertyData.paid_downpayment?.toLocaleString()
                  }`
              },
              {
                label: "Remaining Amount",
                value: `Rs. ${(
                    propertyData.paid_downpayment === propertyData.down_payment
                      ? propertyData.remaining_amount
                      : propertyData.total_price - propertyData.paid_downpayment
                  )?.toLocaleString()
                  }`
              },
              { label: "Total Installment Paid", value: `${propertyData.total_installment_paid?.toLocaleString()} / ${propertyData.total_installment?.toLocaleString()}` },
              { label: "Total Installment Remaining", value: `${propertyData.total_installment_remaining?.toLocaleString()}` },

              { label: "Payment Plan", value: propertyData.payment_plan.toUpperCase(), highlight: true },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl px-5 py-3.5 ${item.highlight
                  ? "bg-charcoal text-white shadow-xl ring-1 ring-primary/30"
                  : "bg-white/60 border border-primary/5 hover:bg-primary/5"
                  }`}
              >
                <span className={`text-xs font-bold uppercase tracking-widest ${item.highlight ? 'text-primary' : 'text-charcoal/40'}`}>
                  {item.label}
                </span>

                {item.label === "Down Payment" ? (
                  <div className="flex items-center gap-3">
                    {isEditingPaidDP ? (
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-bold">Rs. {propertyData.down_payment?.toLocaleString()} / Rs. </span>
                        <input
                          type="number"
                          value={newPaidDP}
                          onChange={(e) => setNewPaidDP(e.target.value)}
                          className="w-24 rounded-lg border border-primary/20 bg-white px-2 py-1 text-sm outline-none focus:border-primary"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdatePaidDP}
                          disabled={updatingPaidDP}
                          className="rounded-lg bg-emerald-500 p-1.5 text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {updatingPaidDP ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                          onClick={() => setIsEditingPaidDP(false)}
                          className="rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-serif text-lg font-bold">{item.value}</span>
                        {isSuperAdmin && propertyData.paid_downpayment > 0 && propertyData.paid_downpayment !== propertyData.down_payment && (
                          <button
                            onClick={() => {
                              setNewPaidDP(propertyData.paid_downpayment || 0);
                              setIsEditingPaidDP(true);
                            }}
                            className="ml-2 rounded-full p-1.5 text-charcoal/40 hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <span className="font-serif text-lg font-bold">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>


      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {isAdmin && (
          <>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-[2.5rem] p-8 premium-border-glow shadow-xl">
              <div className="mb-6 flex items-center gap-4 border-b border-primary/10 pb-6">
                <Users className="text-primary" size={24} />
                <h3 className="font-serif text-xl font-bold text-charcoal">Owner Profile</h3>
              </div>
              <div className="space-y-6">
                {propertyData.owners?.map((owner, idx) => (
                  <div key={idx} className="bg-white/40 rounded-3xl p-6 border border-primary/5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {owner.name?.charAt(0)}
                      </div>
                      <p className="font-serif text-lg font-bold text-charcoal">{owner.name}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <User size={14} className="text-primary/60" />
                        <span>{owner.client_father_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <BadgeCheck size={14} className="text-primary/60" />
                        <span>{owner.client_cnic}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <ShieldCheck size={14} className="text-primary/60" />
                        <span>{owner.nationality}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <MapPin size={14} className="text-primary/60" />
                        <span><span className="font-semibold">Temp Address:</span> {owner.client_residential_address || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <MapPin size={14} className="text-primary/60" />
                        <span><span className="font-semibold">Permanent Address:</span> {owner.client_permanent_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {propertyData.brokers && propertyData.brokers.length > 0 && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="glass rounded-[2.5rem] p-8 premium-border-glow shadow-xl"
              >
                <div className="mb-6 flex items-center gap-4 border-b border-primary/10 pb-6">
                  <Briefcase className="text-primary" size={24} />
                  <h3 className="font-serif text-xl font-bold text-charcoal">
                    Broker Information
                  </h3>
                </div>

                <div className="space-y-6">
                  {propertyData.brokers.map((broker, idx) => (
                    <div
                      key={idx}
                      className="rounded-3xl border border-primary/5 bg-white/40 p-6"
                    >
                      <p className="mb-4 font-serif text-lg font-bold text-charcoal">
                        {broker.broker_name}
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 text-xs text-charcoal/60">
                          <Phone size={14} className="text-primary/60" />
                          <span>{broker.broker_details?.phone || "N/A"}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-charcoal/60">
                          <User size={14} className="text-primary/60" />
                          <span>Relationship: {broker.relationship}</span>
                        </div>

                        {broker.broker_commission > 0 && (
                          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              {/* Left Side */}
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                                  <CircleDollarSign size={18} className="text-white" />
                                </div>

                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                    Commission
                                  </p>
                                  <p className="text-sm font-bold text-charcoal">
                                    Broker Commission
                                  </p>
                                </div>
                              </div>

                              {/* Right Side */}
                              <div className="text-left sm:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                                  Amount
                                </p>
                                <p className="font-serif text-lg font-bold text-emerald-700">
                                  Rs. {broker.broker_commission.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Transfer History (New Owner Record) */}
        {propertyData.transferHistory && propertyData.transferHistory.length > 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-[2.5rem] p-8 premium-border-glow shadow-xl col-span-1 md:col-span-2">
            <div className="mb-6 flex items-center gap-4 border-b border-primary/10 pb-6">
              <BadgeDollarSign className="text-primary" size={24} />
              <h3 className="font-serif text-xl font-bold text-charcoal">Transfer Record</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {propertyData.transferHistory.map((record, idx) => (
                <div key={idx} className="bg-white/40 rounded-3xl p-6 border border-emerald-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-serif text-lg font-bold text-emerald-700">{record.newOwnerName}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 text-xs text-charcoal/60">
                      <BadgeCheck size={14} className="text-primary/60" />
                      <span className="font-bold">CNIC:</span> {record.newOwnerCNIC}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-charcoal/60">
                      <Phone size={14} className="text-primary/60" />
                      <span className="font-bold">Phone:</span> {record.newOwnerPhone}
                    </div>
                    {record.temporaryAddress && (
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <MapPin size={14} className="text-primary/60" />
                        <span className="font-bold">Temp Addr:</span> {record.temporaryAddress}
                      </div>
                    )}
                    {record.permanentAddress && (
                      <div className="flex items-center gap-3 text-xs text-charcoal/60">
                        <MapPin size={14} className="text-primary/60" />
                        <span className="font-bold">Perm Addr:</span> {record.permanentAddress}
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                      <span className="text-[10px] text-charcoal/40 font-bold uppercase">Transferred On</span>
                      <span className="text-xs font-bold text-charcoal">{new Date(record.transferDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Installment Table */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="rounded-[2.5rem] glass overflow-hidden premium-border-glow shadow-2xl"
      >
        <div className="shimmer-gold px-10 py-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-primary/20 gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-charcoal p-3 rounded-2xl shadow-lg">
              <ReceiptText className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                Installment Plan
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {user?.role === "super-admin" && (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary hover:text-charcoal transition-all shadow-lg"
              >
                <BadgeDollarSign size={14} />
                Transfer Unit
              </button>
            )}
            <div className="px-6 py-3 rounded-2xl bg-white/60 border border-primary/10">
              <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Installments Progress</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-charcoal">{propertyData.total_installment_paid || 0}</p>
                <p className="text-xs font-medium text-charcoal/40">/ {propertyData.total_installment || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-charcoal text-white">
                <th className="px-6 py-4 text-xs  font-bold uppercase tracking-[0.25em] text-primary/70 text-center">
                  Property
                </th>
                <th className="px-6 py-4  text-xs  font-bold uppercase tracking-[0.25em] text-primary/70 text-center">
                  Month
                </th>
                <th className="px-6 py-4 text-xs  font-bold uppercase tracking-[0.25em] text-primary/70">
                  Value
                </th>
                <th className="px-6 py-4 text-center text-xs  font-bold uppercase tracking-[0.25em] text-primary/70">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs  font-bold uppercase tracking-[0.25em] text-primary/70">
                  View
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-4 text-center text-xs  font-bold uppercase tracking-[0.25em] text-primary/70">
                    Admin
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-primary/5 bg-white">
              {propertyData.installments?.map((item, index) => (
                <tr
                  key={index}
                  className="transition-colors hover:bg-primary/[0.02]"
                >
                  {/* Property Number */}
                  <td className="px-6 py-4 text-center">
                    <p className="font-serif text-sm font-bold text-charcoal">
                      {propertyData.type} {propertyData.property_number}
                    </p>
                  </td>

                  {/* Month */}
                  <td className="px-6 py-4 text-center">
                    <p className="font-serif text-sm font-bold text-charcoal">
                      {item.monthYear}
                    </p>
                    {item.status === "paid" && item.paidDate && (
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                        {new Date(item.paidDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </td>

                  {/* Value */}
                  <td className="px-6 py-4 font-body text-charcoal/60 font-medium text-center">
                    Rs. {item.amount?.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${item.status === "paid"
                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                        : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                        }`}
                    >
                      {item.status === "paid" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock3 className="h-3 w-3" />
                      )}
                      {item.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>

                  {/* View Receipt */}
                  <td className="px-6 py-4 text-center">
                    {item.status === "paid" ? (
                      item.receiptImage ? (
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={item.receiptImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                            title="View Receipt"
                          >
                            <Eye size={18} />
                          </a>
                          <a
                            href={item.receiptImage.replace('/upload/', '/upload/fl_attachment/')}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal/5 text-charcoal/40 hover:bg-charcoal hover:text-white hover:shadow-lg hover:shadow-charcoal/20 transition-all duration-300"
                            title="Download Receipt"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-charcoal/30 font-bold text-[10px] uppercase tracking-widest">No Receipt</span>
                      )
                    ) : (
                      <span className="text-charcoal/30 font-bold text-[10px] uppercase tracking-widest">Pending</span>
                    )}
                  </td>

                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-right">
                      {item.status !== "paid" ? (
                        <button
                          onClick={() => handleMarkAsPaidPress(index)}
                          disabled={updatingId === index}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50"
                        >
                          {updatingId === index ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Paid
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-[9px] uppercase tracking-widest px-4">
                          <CheckCircle2 size={12} /> OK
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

const PropertyDetailPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-charcoal">Loading property details...</div>}>
      <PropertyDetailContent />
    </Suspense>
  );
};

export default PropertyDetailPage;
