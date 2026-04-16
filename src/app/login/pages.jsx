"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import AuthShowcasePanel from "@/components/AuthShowcasePanel";
import AuthCard from "@/components/AuthCard";
import AuthHeader from "@/components/AuthHeader";
import { fadeUp, fadeRight } from "@/animation/motion";
import { useAuth } from "@/context/AuthContext";

import { toast } from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEmail = formData.identifier.includes("@");
      const loginParams = isEmail
        ? { email: formData.identifier, password: formData.password }
        : { phone: formData.identifier, password: formData.password };

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
                  placeholder="Enter your email or phone number"
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
                {/* <button
                  type="button"
                  onClick={() => router.push("/forget-password")}
                  className="font-medium text-[#c29e6d] transition-colors duration-300 hover:text-[#e2c08f]"
                >
                  Forgot password?
                </button> */}
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