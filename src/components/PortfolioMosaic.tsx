"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/portfolio";

const spans = [
  "col-span-2 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
];

const groupVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const labelVariants = {
  initial: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  animate: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.55, 0, 0.85, 0.35] as const },
  },
};

export default function PortfolioMosaic({ projects }: { projects: Project[] }) {
  const [hovered, setHovered] = useState<Project | null>(null);
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
      className="grid grid-cols-2 md:grid-cols-4 grid-flow-row-dense auto-rows-[40vh] gap-0"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {projects.slice(0, 9).map((project, i) => (
        <Link
          key={project.slug}
          href={`/portfolio/${project.slug}`}
          className={`group relative block overflow-hidden bg-ink ${spans[i] ?? "col-span-1 row-span-1"}`}
          onMouseEnter={() => setHovered(project)}
          onMouseLeave={() => setHovered(null)}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </Link>
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
              className="bg-ink text-paper text-base tracking-widest uppercase px-4 py-2 font-heading whitespace-nowrap"
            >
              {hovered.tags.join(" / ")}
            </motion.span>
            <motion.span
              variants={labelVariants}
              className="bg-ink text-paper text-3xl tracking-wide px-5 py-3 font-heading whitespace-nowrap"
            >
              {hovered.title}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
