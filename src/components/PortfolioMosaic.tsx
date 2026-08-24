"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { WorkItem } from "@/data/work";

// Tailwind needs these span classes to appear literally so it emits them.
// The span each item uses lives on the item itself (work.ts), chosen to match
// its cover's aspect ratio: square -> 2x2 or 1x1, portrait -> 1x2, wide -> 2x1.
// col-span-2 row-span-2 | row-span-2 | col-span-2

const groupVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.18 } },
  exit: { transition: { duration: 0 } },
};

const labelVariants = {
  initial: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  animate: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
    transition: { duration: 0 },
  },
};

export default function PortfolioMosaic({ items }: { items: WorkItem[] }) {
  const [hovered, setHovered] = useState<WorkItem | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flip, setFlip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!hovered || !tooltipRef.current) return;
    const width = tooltipRef.current.getBoundingClientRect().width;
    setFlip(pos.x + 20 + width > window.innerWidth - 16);
  }, [pos, hovered]);

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 grid-flow-row-dense auto-rows-[50vw] lg:auto-rows-[25vw] gap-0"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {items.slice(0, 9).map((project) => (
        // detail pages are disabled for now — tiles are display-only
        <div
          key={project.slug}
          className={`group relative block overflow-hidden bg-ink ${project.span}`}
          onMouseEnter={() => setHovered(project)}
          onMouseLeave={() => setHovered(null)}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
      ))}

      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.slug}
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none flex flex-col items-start gap-[10px]"
            style={{
              left: pos.x,
              top: pos.y + 20,
              transform: flip ? "translateX(calc(-100% - 20px))" : "translateX(20px)",
              transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            variants={groupVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.span
              variants={labelVariants}
              className="bg-ink text-paper text-base leading-none tracking-widest uppercase p-[5px] font-heading whitespace-nowrap"
            >
              {hovered.tags.join(" / ")}
            </motion.span>
            <motion.span
              variants={labelVariants}
              className="bg-ink text-paper text-3xl leading-none tracking-wide uppercase p-[5px] font-heading whitespace-nowrap"
            >
              {hovered.title}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
