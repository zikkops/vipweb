"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { heroSlides } from "@/data/hero";
import { PRELOAD_MS } from "@/lib/preload";
import HeroNav from "./HeroNav";

const AUTO_ADVANCE_MS = 6000;

const imageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const textGroupVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.18 } },
  exit: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
};

const squishVariants = {
  initial: { clipPath: "inset(0 50% 0 50%)" },
  animate: {
    clipPath: "inset(0 0% 0 0%)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    clipPath: "inset(0 50% 0 50%)",
    transition: { duration: 0.6, ease: [0.55, 0, 0.85, 0.35] as const },
  },
};

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), PRELOAD_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const id = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [next, revealed, index]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const slide = heroSlides[index];

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-black">
      <HeroNav />

      {/* Image layer animates independently */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          style={{ y, scale: 2 }}
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/30" />
        </motion.div>
      </AnimatePresence>

      {/* Text layer animates independently */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-page">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              variants={textGroupVariants}
              initial="initial"
              animate={revealed ? "animate" : "initial"}
              exit="exit"
              className="max-w-2xl"
            >
              <h1 className="flex flex-col items-start gap-[6px] text-[95px] leading-[90px] mb-8">
                {slide.titleLines.map((line, i) => (
                  <motion.span
                    key={i}
                    variants={squishVariants}
                    className="bg-paper text-ink px-[5px] pt-0 pb-[5px] box-decoration-clone"
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>
              <motion.div variants={squishVariants} className="inline-block">
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-2 bg-paper text-ink px-6 py-3 font-heading text-[18px] uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
                >
                  {slide.cta} <span>_</span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-paper hover:text-paper/70 transition-colors"
      >
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-paper hover:text-paper/70 transition-colors"
      >
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}
