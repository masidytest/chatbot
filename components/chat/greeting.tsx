"use client";

import { motion } from "framer-motion";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4" key="overview">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <MasidyAnimatedIcon size={52} animate={true} />
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-bold text-2xl tracking-tight md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        style={{ color: "#F97316" }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        MASIDY
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center font-semibold text-xl tracking-tight text-foreground md:text-2xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
