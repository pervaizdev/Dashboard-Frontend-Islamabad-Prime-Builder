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
  BadgeCheck, 
  MapPin, 
  ShieldCheck, 
  Lock,
  Mail,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileSection() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isMatch =
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const hasConfirmValue = confirmPassword.length > 0;

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
    { label: "Full Name", value: "Muhammad Imran", icon: <User className="text-primary" size={18} /> },
    { label: "Phone Number", value: "+92 300 1234567", icon: <Phone className="text-primary" size={18} /> },
    { label: "Active Membership", value: "15 March 2025", icon: <Calendar className="text-primary" size={18} /> },
    { label: "Permanent Address", value: "Village Chakwal, Punjab, Pakistan", icon: <ShieldCheck className="text-primary" size={18} />},
  ];

  return (
    <div className="min-h-screen section-gradient p-4 md:p-8 lg:p-12">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto max-w-5xl space-y-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center md:text-left space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal font-bold tracking-tight">
            Client <span className="text-primary">Profile</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

          {/* Right Column: Information & Settings */}
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
                    <div key={idx} className={`${item.fullWidth ? 'md:col-span-2' : ''} space-y-2`}>
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
                    {newPassword && newPassword.length < 8 && (
                      <p className="text-[10px] text-red-500 mt-1">Wait, your password must be at least 8 characters.</p>
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
                        className={`w-full bg-white border rounded-xl px-4 py-3 pr-20 text-sm text-charcoal outline-none transition-all duration-300 ${
                          hasConfirmValue && isMatch ? 'border-primary' : hasConfirmValue ? 'border-red-300' : 'border-primary/20'
                        } focus:border-primary`}
                      />
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center">
                        <AnimatePresence>
                          {hasConfirmValue && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              {isMatch ? (
                                <CheckCircle size={18} className="text-green-500" />
                              ) : (
                                <XCircle size={18} className="text-red-400" />
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
                    whileHover={isMatch ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isMatch ? { scale: 0.98 } : {}}
                    type="button"
                    disabled={!isMatch}
                    className={`relative overflow-hidden rounded-xl px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${
                      isMatch
                        ? "bg-charcoal text-white hover:bg-black shadow-lg shadow-charcoal/20"
                        : "bg-charcoal/20 text-charcoal/40 cursor-not-allowed"
                    }`}
                  >
                    <span className="relative z-10">Update Profile Security</span>
                    {isMatch && (
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
