"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import AuthShowcasePanel from "@/components/AuthShowcasePanel";
import AuthCard from "@/components/AuthCard";
import AuthHeader from "@/components/AuthHeader";
import { fadeUp, fadeRight } from "@/animation/motion";
import { useAuth } from "@/context/AuthContext";

import { toast } from "react-hot-toast";
import { countryCodes } from "@/constants/countryCodes";

const LoginPage = () => {
  const router = useRouter();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [countryCode, setCountryCode] = useState("+92");
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

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "identifier") {
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
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalIdentifier = formData.identifier;
      if (isPhone) {
        // Remove leading 0 if user added it after picking country code
        const cleanPhone = formData.identifier.replace(/^0+/, "");
        finalIdentifier = `${countryCode}${cleanPhone}`;
      }

      const loginParams = !isPhone
        ? { email: finalIdentifier, password: formData.password }
        : { phone: finalIdentifier, password: formData.password };

      const data = await login(loginParams);

      if (!data?.success) {
        toast.error(data?.message || "Invalid credentials. Please try again.");
      } else {
        toast.success("Login successful!");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#08211e] lg:grid-cols-2">
      <AuthShowcasePanel />

      <div className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
        <div className="absolute inset-0" />

        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md"
        >
          <AuthCard className="bg-white/5">
            <AuthHeader
              title="Welcome Back"
              subtitle="Enter your email or phone and password to continue."
            />

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
              >
                <Input
                  label="Email or Phone"
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={onChangeHandler}
                  placeholder={isPhone ? "3001234567" : "Enter your email or phone number"}
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

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.4}
              >
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChangeHandler}
                  placeholder="Enter your password"
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.5}
                className="flex justify-end text-sm"
              >
                <button
                  type="button"
                  onClick={() => router.push("/forget-password")}
                  className="font-medium text-[#c29e6d] transition-colors duration-300 hover:text-[#e2c08f]"
                >
                  Forgot password?
                </button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.6}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c29e6d] to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-[#c29e6d]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c29e6d]/30 disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </motion.div>
            </form>
          </AuthCard>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;