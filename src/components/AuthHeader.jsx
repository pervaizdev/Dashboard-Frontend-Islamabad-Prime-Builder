"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/animation/motion";

const AuthHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8 text-center">
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="font-serif text-3xl font-bold tracking-tight text-white md:text-4xl"
      >
        {title}
      </motion.h1>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.1}
        className="mt-2 text-sm text-primary"
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

export default AuthHeader;
