"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function LineWipeTitle({
  text,
  hovered,
  textClassName = "",
}: {
  text: string;
  hovered: boolean;
  textClassName?: string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([text]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      el.textContent = text;
      const textNode = el.firstChild;
      if (!textNode) return;

      const words = text.split(" ");
      const groups: string[][] = [];
      let lastTop: number | null = null;
      let offset = 0;

      words.forEach((w) => {
        const start = offset;
        const end = start + w.length;
        const range = document.createRange();
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        const top = range.getBoundingClientRect().top;

        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          groups.push([]);
          lastTop = top;
        }
        groups[groups.length - 1].push(w);
        offset = end + 1;
      });

      setLines(groups.map((g) => g.join(" ")));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure);
    }

    return () => ro.disconnect();
  }, [text]);

  return (
    <div className="relative">
      <div
        ref={measureRef}
        className={`invisible h-0 overflow-hidden ${textClassName}`}
        aria-hidden
      />
      {lines.map((line, i) => (
        <div key={i} className="relative block w-fit">
          <span className={`relative z-0 text-ink ${textClassName}`}>{line}</span>
          <motion.span
            className={`absolute inset-0 z-10 bg-ink text-paper whitespace-nowrap ${textClassName}`}
            initial={false}
            animate={{ clipPath: hovered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
              delay: hovered ? i * 0.15 : 0,
            }}
          >
            {line}
          </motion.span>
        </div>
      ))}
    </div>
  );
}
