"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function RotatingIcon({
  src,
  alt = "",
  angle = 36,
  delay = 0,
}: {
  src: string;
  alt?: string;
  angle?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="w-20 h-20 mb-4"
      animate={{ rotate: [0, angle, 0] }}
      transition={{
        duration: 1.4,
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 2.5,
        delay,
        ease: "easeInOut",
      }}
    >
      <Image src={src} alt={alt} width={80} height={80} className="w-full h-full" />
    </motion.div>
  );
}
