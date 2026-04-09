"use client";

import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  duration?: number;
};

export function OnboardingStepTransition({ children, duration = 0.35 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
