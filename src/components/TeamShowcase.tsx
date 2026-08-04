"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faXTwitter, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import type { TeamMember, Social } from "@/data/team";

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGGER = 0.08;

const socialIcons: Record<Social["platform"], typeof faInstagram> = {
  instagram: faInstagram,
  x: faXTwitter,
  linkedin: faLinkedinIn,
};

export default function TeamShowcase({ members }: { members: TeamMember[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4">
      {members.map((member, i) => {
        const isHovered = hoveredIndex === i;
        return (
          <div
            key={member.slug}
            className="relative h-[70vh] min-h-[420px] overflow-hidden"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />

            <motion.div
              className="absolute inset-0 bg-paper"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="flex flex-col items-start text-left text-ink">
              <motion.h3
                className="font-heading text-2xl mb-1"
                initial={{ opacity: 0, x: -40 }}
                animate={
                  isHovered
                    ? { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE, delay: 0 * STAGGER } }
                    : { opacity: 0, x: -40, transition: { duration: 0.25, ease: EASE } }
                }
              >
                {member.name}
              </motion.h3>
              <motion.div
                className="text-sm text-muted mb-4"
                initial={{ opacity: 0, x: -40 }}
                animate={
                  isHovered
                    ? { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE, delay: 1 * STAGGER } }
                    : { opacity: 0, x: -40, transition: { duration: 0.25, ease: EASE } }
                }
              >
                {member.role}
              </motion.div>
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, x: -40 }}
                animate={
                  isHovered
                    ? { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE, delay: 2 * STAGGER } }
                    : { opacity: 0, x: -40, transition: { duration: 0.25, ease: EASE } }
                }
              >
                {member.socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.href}
                    aria-label={s.platform}
                    className="text-ink hover:text-muted transition-colors"
                  >
                    <FontAwesomeIcon icon={socialIcons[s.platform]} className="w-4 h-4" />
                  </a>
                ))}
              </motion.div>
            </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
