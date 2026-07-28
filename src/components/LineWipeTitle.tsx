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
      const words = text.split(" ");
      el.textContent = "";
      const spans = words.map((w) => {
        const span = document.createElement("span");
        span.textContent = w + " ";
        span.style.display = "inline-block";
        el.appendChild(span);
        return span;
      });

      const groups: string[][] = [];
      let lastTop: number | null = null;
      spans.forEach((span, i) => {
        const top = span.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          groups.push([]);
          lastTop = top;
        }
        groups[groups.length - 1].push(words[i]);
      });
      setLines(groups.map((g) => g.join(" ")));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div className="relative">
      <div
        ref={measureRef}
        className={`invisible absolute inset-x-0 top-0 ${textClassName}`}
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
