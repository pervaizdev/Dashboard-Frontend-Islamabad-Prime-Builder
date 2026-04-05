"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import AuthBlobBackground from "@/components/AnimatedBackground";
import AuthCard from "@/components/AuthCard";
import AuthHeader from "@/components/AuthHeader";
import { fadeUp, popIn } from "@/animation/motion";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      router.push("/forget-password");
    }
  }, [token, router]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      return toast.error("Both fields are required");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      // Mocking API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password reset successfully! You can now login.");
      router.push("/login");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08211e] px-4">
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
            title="Reset Password"
            subtitle="Enter your new password below."
          />

          <form onSubmit={onSubmitHandler} className="space-y-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.25}
            >
              <Input
                label="New Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={onChangeHandler}
                placeholder="Enter new password"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.35}
            >
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChangeHandler}
                placeholder="Confirm new password"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
            >
              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-[#c29e6d] to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-[#c29e6d]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c29e6d]/30"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </motion.div>
          </form>
        </AuthCard>
      </motion.div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#08211e] text-white">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;