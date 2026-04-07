"use client";

import { useState } from "react";
import { authAPI } from "@/api/auth";
import toast from "react-hot-toast";
import Link from "next/link";
import { User, Mail, Phone, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.phone || !formData.password) {
            toast.error("Please fill in all required fields (Name, Phone, Password)");
            return;
        }

        try {
            setLoading(true);
            const response = await authAPI.signUp(formData);
            if (response.success) {
                toast.success("Account created successfully!");
                // Optionally redirect
            }
        } catch (error) {
            toast.error(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-6 mt-10 lg:mt-0">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                        <div className=" rounded-[2rem]  md:p-8 premium-border-glow shadow-2xl relative overflow-hidden">
                            {/* Background Shimmer */}
                    <div className="absolute inset-0  opacity-10 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="mb-6 text-center">
                            <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Create Account</h1>
                            <p className="text-charcoal/40 font-medium uppercase tracking-[0.2em] text-[9px]">
                                Join the elite property network
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Row 1: Name and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 px-1">
                                        Full Name <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Enter your name"
                                            className="h-11 w-full rounded-xl border border-primary/10 bg-white/50 pl-11 pr-4 text-[13px]  text-charcoal outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 px-1">
                                        Email (Optional)
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="imran@example.com"
                                            className="h-11 w-full rounded-xl border border-primary/10 bg-white/50 pl-11 pr-4 text-[13px]  text-charcoal outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Phone and Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 px-1">
                                        Phone Number <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="03001234567"
                                            className="h-11 w-full rounded-xl border border-primary/10 bg-white/50 pl-11 pr-4 text-[13px]  text-charcoal outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40 px-1">
                                        Password <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                                        <input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-11 w-full rounded-xl border border-primary/10 bg-white/50 pl-11 pr-4  text-charcoal outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-charcoal py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-primary shadow-2xl shadow-charcoal/20 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Sign Up
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-2" />
                                        </>
                                    )}
                                </button>
                            </div>

                          
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}