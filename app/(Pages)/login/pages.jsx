"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useLogin from "@/Hooks/useLogin";
import Input from "@/Components/Input.jsx";
import Button from "@/Components/Button.jsx";
import AuthBlobBackground from "@/Components/AuthBlobBackground";
import AuthShowcasePanel from "@/Components/AuthShowcasePanel";
import AuthCard from "@/Components/AuthCard";
import AuthHeader from "@/Components/AuthHeader";
import { fadeUp, fadeRight } from "@/lib/motion";

const LoginPage = () => {
  const router = useRouter();
  const { handleLogin, loading } = useLogin();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      await handleLogin(formData);
      router.push("/dashboard");
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#08211e] lg:grid-cols-2">
      <AuthShowcasePanel />

      <div className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(194,158,109,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(194,158,109,0.12),_transparent_30%)]" />

        <AuthBlobBackground />

        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md"
        >
          <AuthCard className="bg-white/5">
            <AuthHeader
              title="Welcome Back"
              subtitle="Enter your email and password to continue."
            />

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
              >
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChangeHandler}
                  placeholder="Enter your email"
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
                  className="w-full bg-gradient-to-r from-[#c29e6d] to-[#b68c57] py-3 text-[#08211e] shadow-lg shadow-[#c29e6d]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c29e6d]/30"
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