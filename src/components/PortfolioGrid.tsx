"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PortfolioCard from "./PortfolioCard";
import { projects, categories } from "@/data/portfolio";

export default function PortfolioGrid() {
  const [active, setActive] = useState<string>("All");

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-12">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`font-heading text-sm tracking-widest px-4 py-2 border transition-colors ${
              active === cat
                ? "bg-ink text-paper border-ink"
                : "border-hairline text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={active}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {filtered.map((project) => (
            <motion.div
              key={project.slug}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <PortfolioCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
