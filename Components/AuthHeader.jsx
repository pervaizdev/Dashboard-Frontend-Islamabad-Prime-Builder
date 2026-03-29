"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8 text-center">
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="mb-2 text-3xl font-extrabold tracking-tight text-[#c29e6d]"
      >
        {title}
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.2}
        className="text-sm leading-6 text-[#d7d2c8]/80"
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

export default AuthHeader;