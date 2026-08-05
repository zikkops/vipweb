"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Testimonial = { quote: string; name: string; role: string };

export default function TestimonialsCarousel({
  items,
}: {
  items: Testimonial[];
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    const id = setInterval(() => go(1), 6000);
    return () => clearInterval(id);
  }, [go]);

  const current = items[index];

  return (
    <div className="relative max-w-3xl">
      <div className="absolute right-0 top-0 flex gap-3 opacity-20 pointer-events-none select-none" aria-hidden>
        <span className="w-8 md:w-10 h-24 md:h-28 bg-paper -skew-x-[20deg]" />
        <span className="w-8 md:w-10 h-24 md:h-28 bg-paper -skew-x-[20deg]" />
      </div>

      <div className="relative min-h-[220px] flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-heading font-semibold uppercase text-[26px] leading-snug mb-6 max-w-xl">
              &ldquo;{current.quote}&rdquo;
            </p>
            <div className="text-paper/80 normal-case">- {current.name} -</div>
            <div className="text-muted-light text-sm normal-case">{current.role}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mt-8">
        {items.map((t, i) => (
          <button
            key={t.name}
            aria-label={`Show testimonial ${i + 1}`}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-[3px] transition-all ${
              i === index ? "w-10 bg-paper" : "w-6 bg-paper/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
