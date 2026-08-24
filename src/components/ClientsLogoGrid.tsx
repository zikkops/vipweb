"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import type { Client } from "@/data/clients";

export default function ClientsLogoGrid({ clients }: { clients: Client[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [delays, setDelays] = useState<number[]>(() => clients.map(() => 0));
  const [dimDelays, setDimDelays] = useState<number[]>(() => clients.map(() => 0));

  useEffect(() => {
    setDelays(clients.map(() => Math.random() * 0.8));

    const order = clients.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const step = 0.06;
    const shuffledDelays = new Array(clients.length);
    order.forEach((originalIndex, rank) => {
      shuffledDelays[originalIndex] = rank * step;
    });
    setDimDelays(shuffledDelays);
  }, [clients]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
      {clients.map((client, i) => {
        const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
        return (
        <motion.div
          key={client.name}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delays[i], ease: "easeOut" }}
        >
          <motion.div
            className="flex h-[115px] sm:h-[134px] lg:h-[154px] items-center justify-center"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            animate={{ opacity: isDimmed ? 0.12 : 1 }}
            transition={
              isDimmed
                ? { duration: 0, delay: dimDelays[i] }
                : { duration: 0.5, delay: dimDelays[i], ease: "easeOut" }
            }
          >
            <motion.div
              className="flex h-full w-full items-center justify-center"
              whileHover={{ y: [0, -5, 0] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={client.width}
                height={client.height}
                sizes="200px"
                className="object-contain h-auto w-auto max-h-full max-w-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
        );
      })}
    </div>
  );
}
