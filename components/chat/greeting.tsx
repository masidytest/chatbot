"use client";

import { motion } from "framer-motion";
import { SunDim } from "lucide-react";
import { MasidyBrand } from "@/components/chat/masidy-logo";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4" key="overview">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="flex items-center gap-2.5">
          <SunDim size={32} strokeWidth={1.5} className="text-foreground" />
          <span className="text-2xl font-semibold tracking-tight text-foreground">masidy</span>
        </span>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        How can I help you today?
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 text-center text-muted-foreground/80 text-sm"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Search the web · Analyze documents · Write · Code · Remember
      </motion.div>
    </div>
  );
};
