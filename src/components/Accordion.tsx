"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Accordion({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const isHovered = hoveredIndex === i;
        const showBlack = isHovered || isOpen;
        return (
          <div key={item.title}>
            <button
              className="relative w-full flex items-center justify-between py-2 text-left"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[30px] bg-ink z-0"
                initial={false}
                animate={{ width: showBlack ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
              <span
                className={`relative z-10 font-heading uppercase text-[26px] p-[5px] transition-colors duration-300 ${
                  showBlack ? "text-paper" : "text-ink"
                }`}
              >
                {item.title}
              </span>
              <motion.span
                className={`relative z-10 font-heading text-xl inline-block shrink-0 ml-4 pr-[5px] transition-colors duration-300 ${
                  showBlack ? "text-paper" : "text-ink"
                }`}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-2 text-muted max-w-2xl">{item.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
