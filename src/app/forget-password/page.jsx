"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import AuthBlobBackground from "@/components/AnimatedBackground";
import AuthCard from "@/components/AuthCard";
import AuthHeader from "@/components/AuthHeader";
import { fadeUp, popIn } from "@/animation/motion";

import { authAPI } from "@/api/auth";
import { countryCodes } from "@/constants/countryCodes";

const ForgetPasswordPage = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("identifier");
  const [requestMethod, setRequestMethod] = useState(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [isPhone, setIsPhone] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isDropdownOpen) {
      setSearchTerm("");
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countryCodes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.includes(searchTerm) ||
    c.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes.find(c => c.label === "PAK");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);

    // Auto-detect phone vs email
    // If it contains '@', it's definitely an email
    if (value.includes("@")) {
      setIsPhone(false);
    } else {
      // If it starts with a digit or '+', treat as phone
      const phoneRegex = /^[0-9+]/;
      if (phoneRegex.test(value)) {
        setIsPhone(true);
      } else {
        setIsPhone(false);
      }
    }
  };

  const onIdentifierSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error("Email or phone is required");

    let finalIdentifier = identifier;
    if (isPhone) {
      // Remove leading 0 if user added it after picking country code
      const cleanPhone = identifier.replace(/^0+/, "");
      finalIdentifier = `${countryCode}${cleanPhone}`;
    }

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(finalIdentifier);
      if (res.success) {
        setRequestMethod(res.method);
        if (res.method === "phone") {
          setPhoneValue(res.phone);
          setStep("otp");
          toast.success("OTP sent to your phone");
        } else {
          toast.success("Reset link sent to your email");
          setStep("confirmed");
        }
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("OTP is required");

    try {
      setLoading(true);
      const res = await authAPI.verifyOTP(phoneValue, otp);
      if (res.success) {
        toast.success("OTP verified!");
        router.push(`/reset-password?token=${res.resetToken}`);
      }
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08211e] px-4">
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,158,109,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(194,158,109,0.12),transparent_30%)]" />

      <AuthBlobBackground />

      <motion.div
        variants={popIn}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="relative z-10 w-full max-w-md"
      >
        <AuthCard className="bg-white/5">
          <AuthHeader
            title={step === "otp" ? "Verify OTP" : "Forgot Password"}
            subtitle={
              step === "otp"
                ? `Enter the 6-digit code sent to ${phoneValue}`
                : step === "confirmed"
                  ? "Check your email for the reset link. If you don't see it, please check your spam/junk folder."
                  : "Enter your email or phone to reset password."
            }
          />

          {step === "identifier" && (
            <form onSubmit={onIdentifierSubmit} className="space-y-6">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.25}>
                <Input
                  label="Email or Phone Number"
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={handleInputChange}
                  placeholder={isPhone ? "3001234567" : "e.g. user@app.com"}
                  prefix={
                    isPhone ? (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-1.5 text-[#c19c6a] font-bold text-sm outline-none cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                        >
                          <span>{selectedCountry.label} {countryCode}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 4 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-[-20px] top-full z-[100] mt-2 w-48 max-h-64 overflow-hidden rounded-xl border border-[#c29e6d]/30 bg-[#08211e] shadow-2xl backdrop-blur-xl"
                            >
                              <div className="p-2 border-b border-[#c29e6d]/10">
                                <input
                                  ref={searchInputRef}
                                  type="text"
                                  placeholder="Search country..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-white/5 border border-[#c29e6d]/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#cbb89a]/50 outline-none focus:border-[#c29e6d]/50 transition-colors"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                <div className="py-1">
                                  {filteredCountries.length > 0 ? (
                                    filteredCountries.map((c) => (
                                      <button
                                        key={`${c.label}-${c.code}`}
                                        type="button"
                                        onClick={() => {
                                          setCountryCode(c.code);
                                          setIsDropdownOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-[#c29e6d]/10 ${countryCode === c.code ? "bg-[#c29e6d]/20 text-white" : "text-[#cbb89a]"
                                          }`}
                                      >
                                        <div className="flex flex-col items-start">
                                          <span className="font-semibold text-xs">{c.name}</span>
                                          <span className="text-[10px] opacity-60">{c.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#c29e6d]">{c.code}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-3 text-xs text-[#cbb89a]/50 text-center">
                                      No countries found
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : null
                  }
                />
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.35}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-primary to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                >
                  {loading ? "Processing..." : "Continue"}
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.45}>
                <Button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full border border-primary/40 py-3 text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Back to Login
                </Button>
              </motion.div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={onOtpSubmit} className="space-y-6">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.25}>
                <Input
                  label="6-Digit OTP"
                  type="text"
                  maxLength={6}
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em] font-bold"
                />
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.35}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-primary to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.45}>
                <button
                  type="button"
                  onClick={() => setStep("identifier")}
                  className="w-full text-center text-xs text-primary/60 hover:text-primary transition-colors"
                >
                  Used wrong number? Go back
                </button>
              </motion.div>
            </form>
          )}

          {step === "confirmed" && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-linear-to-r from-primary to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-primary/20"
              >
                Return to Login
              </Button>
            </motion.div>
          )}
        </AuthCard>
      </motion.div>
    </div>
  );
};

export default ForgetPasswordPage;
