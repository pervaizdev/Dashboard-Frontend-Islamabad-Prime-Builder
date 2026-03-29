"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { forgotPasswordApi } from "@/Api/auth";
import Input from "@/Components/Input.jsx";
import Button from "@/Components/Button.jsx";
import AuthBlobBackground from "@/Components/AuthBlobBackground";
import AuthCard from "@/Components/AuthCard";
import AuthHeader from "@/Components/AuthHeader";
import { fadeUp, popIn } from "@/lib/motion";

const ForgetPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Email is required");

    try {
      setLoading(true);
      await forgotPasswordApi({ email });
      setSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08211e] px-4">
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(194,158,109,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(194,158,109,0.12),_transparent_30%)]" />

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
            title="Forgot Password"
            subtitle={
              sent
                ? "Check your email for the reset link."
                : "Enter your email to receive a password reset link."
            }
          />

          {!sent ? (
            <form onSubmit={onSubmitHandler} className="space-y-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.25}
              >
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.35}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c29e6d] to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-[#c29e6d]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c29e6d]/30"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </motion.div>

              {/* ✅ Back to Login Button */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.45}
              >
                <Button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full border border-[#c29e6d]/40 py-3 text-[#c29e6d] hover:bg-[#c29e6d]/10 transition-all duration-300"
                >
                  Back to Login
                </Button>
              </motion.div>
            </form>
          ) : (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-[#c29e6d] to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-[#c29e6d]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c29e6d]/30"
              >
                Back to Login
              </Button>
            </motion.div>
          )}
        </AuthCard>
      </motion.div>
    </div>
  );
};

export default ForgetPasswordPage;