"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post } from "@/data/blog";
import LineWipeTitle from "@/components/LineWipeTitle";

export default function NewsCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);
  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="group flex flex-col min-h-[220px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-[16px] text-muted mb-3">
        {post.category} — {date}
      </div>
      <Link href={`/blog/${post.slug}`} className="block w-full">
        <LineWipeTitle
          text={post.title}
          hovered={hovered}
          textClassName="font-heading font-bold text-[35px] leading-snug"
        />
      </Link>
      <Link
        href={`/blog/${post.slug}`}
        className="group/read inline-flex items-center font-heading font-bold text-[16px] tracking-widest text-ink mt-4"
      >
        Read More
        <span className="group-hover/read:animate-[color-blink_3s_steps(1)_infinite]">_</span>
      </Link>
    </div>
  );
}
