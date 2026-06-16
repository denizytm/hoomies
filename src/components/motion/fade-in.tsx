"use client";

import { motion } from "motion/react";
import type { ComponentProps } from "react";

type FadeInProps = ComponentProps<typeof motion.div> & {
  delay?: number;
  y?: number;
};

// Lightweight entrance animation used across marketing + app surfaces.
export function FadeIn({ delay = 0, y = 12, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered container — children using FadeIn with incremental delays.
export function Stagger({ children, ...props }: ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
