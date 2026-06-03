"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MasidyAnimatedIcon } from "@/components/chat/masidy-animated-icon";

function getTimeGreeting(): { greeting: string; sub: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: "Good morning", sub: "How can I help you today?" };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: "Good afternoon", sub: "What can I help you with?" };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: "Good evening", sub: "Ready to help." };
  } else {
    return { greeting: "Working late?", sub: "I'm here whenever you need me." };
  }
}

export const Greeting = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { greeting, sub } = getTimeGreeting();

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d: { name: string | null; isGuest: boolean }) => {
        setUserName(d.name);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const headingText = loaded
    ? userName
      ? `${greeting}, ${userName}!`
      : `${greeting}!`
    : `${greeting}!`;

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
        className="text-center font-bold text-2xl tracking-tight text-foreground md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        MASIDY
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center font-semibold text-xl tracking-tight text-foreground md:text-2xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        key={headingText}
      >
        {headingText}
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 text-center text-muted-foreground/80 text-[15px]"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {sub}
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center text-muted-foreground/50 text-sm"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Search the web · Live weather & stocks · Write · Code · Remember
      </motion.div>
    </div>
  );
};
