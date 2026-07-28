"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { heroSlides } from "@/data/hero";

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
  animate: { transition: { staggerChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const eyebrowVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

const squishVariants = {
  initial: { clipPath: "inset(0 50% 0 50%)" },
  animate: {
    clipPath: "inset(0 0% 0 0%)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    clipPath: "inset(0 50% 0 50%)",
    transition: { duration: 0.4, ease: [0.55, 0, 0.85, 0.35] as const },
  },
};

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [next]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const slide = heroSlides[index];

  return (
    <section ref={sectionRef} className="relative -mt-20 h-screen w-full overflow-hidden bg-ink">
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
              key={slide.eyebrow}
              variants={textGroupVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-2xl"
            >
              <motion.div
                variants={eyebrowVariants}
                className="font-heading text-sm tracking-[0.3em] text-paper/70 mb-4"
              >
                {slide.eyebrow}
              </motion.div>
              <h1 className="flex flex-col items-start gap-[6px] text-5xl md:text-7xl leading-[1.15] mb-8">
                {slide.titleLines.map((line, i) => (
                  <motion.span
                    key={i}
                    variants={squishVariants}
                    className="bg-paper text-ink px-3 py-1 box-decoration-clone"
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>
              <motion.div variants={squishVariants} className="inline-block">
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-2 border border-paper text-paper px-6 py-3 font-heading text-sm tracking-widest hover:bg-paper hover:text-ink transition-colors"
                >
                  {slide.cta} <span>_</span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="container-page flex items-center gap-3">
          {heroSlides.map((s, i) => (
            <button
              key={s.image}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-1 flex-1 max-w-16 bg-paper/30 overflow-hidden"
            >
              {i === index && (
                <motion.span
                  key={`${index}-progress`}
                  className="absolute inset-y-0 left-0 bg-paper"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: "linear" }}
                />
              )}
              {i !== index && <span className="absolute inset-0 bg-paper/30" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
