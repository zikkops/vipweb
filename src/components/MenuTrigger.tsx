"use client";

import { motion } from "framer-motion";

export default function MenuTrigger({
  open,
  onClick,
  dark = false,
}: {
  open: boolean;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      className="relative z-[130] flex flex-col justify-center gap-2 w-8 h-8"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
    >
      <motion.span
        className={`w-8 h-0.5 block ${dark ? "bg-ink" : "bg-paper"}`}
        animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.span
        className={`w-8 h-0.5 block ${dark ? "bg-ink" : "bg-paper"}`}
        animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
      />
    </button>
  );
}
