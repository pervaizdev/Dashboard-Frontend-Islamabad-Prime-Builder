"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import AuthBlobBackground from "@/components/AnimatedBackground";
import AuthCard from "@/components/AuthCard";
import AuthHeader from "@/components/AuthHeader";
import { fadeUp, popIn } from "@/animation/motion";

import { authAPI } from "@/api/auth";

const ForgetPasswordPage = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("identifier"); 
  const [requestMethod, setRequestMethod] = useState(null); 
  const [phoneValue, setPhoneValue] = useState("");

  const onIdentifierSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error("Email or phone is required");

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(identifier);
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
                ? "Check your email for the reset link."
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
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. user@app.com or 03001234567"
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
