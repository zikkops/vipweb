"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Client = { name: string; logo: string };

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
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-8 gap-y-12">
      {clients.map((client, i) => (
        <motion.div
          key={client.name}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delays[i], ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center py-2"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            animate={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.5 }}
            transition={{ duration: 0.4, delay: dimDelays[i], ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ y: [0, -5, 0] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={72}
                height={72}
                className="object-contain w-14 h-14 md:w-16 md:h-16"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
