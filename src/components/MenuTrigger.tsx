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
    // The drawer carries its own close button, so this fades out while the
    // menu is open — otherwise the hero shows two X icons at once, since
    // there the trigger stacks above the drawer.
    <motion.button
      className="relative z-[130] flex flex-col justify-center gap-2 w-8 h-8"
      aria-label="Open menu"
      aria-expanded={open}
      aria-hidden={open}
      tabIndex={open ? -1 : 0}
      onClick={onClick}
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: open ? "none" : "auto" }}
    >
      <span className={`w-8 h-0.5 block ${dark ? "bg-ink" : "bg-paper"}`} />
      <span className={`w-8 h-0.5 block ${dark ? "bg-ink" : "bg-paper"}`} />
    </motion.button>
  );
}
