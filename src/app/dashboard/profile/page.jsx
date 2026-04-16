"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  Lock,
  Mail,
  X,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/api/auth.jsx";
import { toast } from "react-hot-toast";

export default function ProfileSection() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStrength = (password) => {
    if (!password) return { label: "", color: "transparent", width: "0%" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: "Weak", color: "#fb7185", width: "33%" };
    if (strength <= 4) return { label: "Medium", color: "#fbbf24", width: "66%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  };

  const strength = getStrength(newPassword);

  const isMatch =
    newPassword.length >= 2 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const hasConfirmValue = confirmPassword.length > 0;

  const handleUpdatePassword = async () => {
    if (!isMatch) return;

    try {
      setIsUpdating(true);
      const res = await authAPI.updatePassword(newPassword);
      if (res.success) {
        toast.success("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
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

  const profileData = [
    {
      label: "Full Name",
      value: user?.name || "N/A",
      icon: <User className="text-primary" size={18} />
    },
    {
      label: "Phone Number",
      value: user?.phone || "N/A",
      icon: <Phone className="text-primary" size={18} />
    },
    {
      label: "Email Address",
      value: user?.email || "N/A",
      icon: <Mail className="text-primary" size={18} />
    },
    {
      label: "Active Membership",
      value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A",
      icon: <Calendar className="text-primary" size={18} />
    },
    {
      label: "Residential Address",
      value: user?.owner_profile?.client_residential_address || "N/A",
      icon: <MapPin size={18} className="text-primary" />,
    },
    {
      label: "Permanent Address",
      value: user?.owner_profile?.client_permanent_address || "N/A",
      icon: <ShieldCheck className="text-primary" size={18} />,
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto max-w-5xl space-y-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center md:text-left space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-bold tracking-tight">
            User <span className="text-primary">Profile</span>
          </h1>
          <p className="text-charcoal/50 text-sm font-medium tracking-wide uppercase">Manage your account information and security</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Read-only Information Section */}
            <motion.div variants={itemVariants} className="glass rounded-[2rem] overflow-hidden premium-border-glow">
              <div className="shimmer-gold px-8 py-5 flex items-center justify-between border-b border-primary/20">
                <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  PERSONAL INFORMATION
                </h3>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.value}
                          readOnly
                          className="w-full bg-white/40 border border-primary/10 rounded-xl px-4 py-3 text-sm text-charcoal font-medium outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Password Update Section */}
            <motion.div variants={itemVariants} className="glass rounded-[2rem] overflow-hidden premium-border-glow">
              <div className="px-8 py-5 flex items-center justify-between border-b border-primary/10 bg-charcoal/5">
                <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  SECURITY SETTINGS
                </h3>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                      <Lock size={14} className="text-primary" />
                      NEW PASSWORD
                    </label>
                    <div className="relative group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 pr-12 text-sm text-charcoal outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-primary transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40">Security Level</span>
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: strength.color }}
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-charcoal/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className="h-full transition-all duration-500 ease-out"
                            style={{ backgroundColor: strength.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-primary" />
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full bg-white border rounded-xl px-4 py-3 pr-20 text-sm text-charcoal outline-none transition-all duration-300 ${hasConfirmValue && isMatch ? 'border-primary' : hasConfirmValue ? 'border-rose-400' : 'border-primary/20'
                          } focus:border-primary`}
                      />

                      {/* Live Tick/Cross Overlay */}
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center">
                        <AnimatePresence mode="wait">
                          {hasConfirmValue && (
                            <motion.div
                              key={isMatch ? "match" : "no-match"}
                              initial={{ scale: 0, opacity: 0, rotate: -45 }}
                              animate={{ scale: 1, opacity: 1, rotate: 0 }}
                              exit={{ scale: 0, opacity: 0, rotate: 45 }}
                            >
                              {isMatch ? (
                                <div className="rounded-full bg-emerald-100 p-1">
                                  <Check size={14} className="text-emerald-600 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="rounded-full bg-rose-100 p-1">
                                  <X size={14} className="text-rose-500 stroke-[3]" />
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <motion.button
                    whileHover={isMatch && !isUpdating ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isMatch && !isUpdating ? { scale: 0.98 } : {}}
                    onClick={handleUpdatePassword}
                    disabled={!isMatch || isUpdating}
                    className={`relative min-w-[220px] overflow-hidden rounded-xl px-10 py-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${isMatch
                        ? "bg-charcoal text-white hover:bg-black shadow-lg shadow-charcoal/20"
                        : "bg-charcoal/20 text-charcoal/40 cursor-not-allowed"
                      }`}
                  >
                    <span className="relative z-10">
                      {isUpdating ? "Updating..." : "Update Password"}
                    </span>
                    {isMatch && !isUpdating && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                      />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MapPin(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
