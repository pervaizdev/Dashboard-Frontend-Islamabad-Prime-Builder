"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeLeft } from "@/animation/motion";

const AuthShowcasePanel = () => {
  return (
    <motion.div
      variants={fadeLeft}
      initial="hidden"
      animate="visible"
      className="relative hidden min-h-screen overflow-hidden lg:block"
    >
      <Image
        src="/images/building2.png"
        alt="Prime Builder"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />

      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
        <div className="max-w-lg rounded-3xl border border-white/20 bg-white/10 p-8 text-white backdrop-blur-md">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-white/70">
            Prime Builder
          </p>
          <h2 className="mb-4 text-4xl font-bold leading-tight">
            Build smarter. Manage clients and properties beautifully.
          </h2>
          <p className="text-sm leading-6 text-white/80">
            A refined platform experience for premium real estate, architecture,
            and client operations.
          </p>
        </div>
      </div> */}
    </motion.div>
  );
};

export default AuthShowcasePanel;