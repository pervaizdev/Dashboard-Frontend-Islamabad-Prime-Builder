"use client";

import { motion } from "framer-motion";

const AuthBlobBackground = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-[#c29e6d] blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-[25%] left-[-10%] h-96 w-96 rounded-full bg-[#c29e6d] blur-[130px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.4 }}
        className="absolute bottom-[-10%] right-[20%] h-96 w-96 rounded-full bg-[#c29e6d] blur-[140px]"
      />
    </>
  );
};

export default AuthBlobBackground;