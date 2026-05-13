import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

export const FadeIn = ({ children, delay = 0, ...props }: { children: React.ReactNode; delay?: number } & HTMLMotionProps<"div">) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    {...props}
  >
    {children}
  </motion.div>
);

export const HoverScale = ({ children, ...props }: { children: React.ReactNode } & HTMLMotionProps<"div">) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

export const GlowCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative group overflow-hidden rounded-xl ${className}`}
      whileHover="hover"
    >
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        variants={{
          hover: { scale: 1.1 }
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
