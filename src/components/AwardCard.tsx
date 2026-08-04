"use client";

import { useState } from "react";
import LineWipeTitle from "@/components/LineWipeTitle";

type Award = { title: string; subtitle: string; description: string };

export default function AwardCard({ award }: { award: Award }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-xs text-muted uppercase mb-3">
        {award.subtitle}
      </div>
      <LineWipeTitle
        text={award.title}
        hovered={hovered}
        textClassName="font-heading text-xl md:text-2xl leading-snug"
      />
      <p className="text-muted text-sm mt-4 normal-case max-w-sm">{award.description}</p>
    </div>
  );
}
