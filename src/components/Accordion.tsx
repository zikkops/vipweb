"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Accordion({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-hairline border-t border-b border-hairline">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.title}>
            <button
              className="w-full flex items-center justify-between py-5 text-left"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
            >
              <span className="font-heading text-lg md:text-xl">{item.title}</span>
              <motion.span
                className="font-heading text-xl inline-block"
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
                  <p className="pb-5 text-muted max-w-2xl">{item.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
