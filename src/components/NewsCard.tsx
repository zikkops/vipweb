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
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="font-heading text-xs tracking-widest text-muted uppercase mb-3">
        {post.category} — {date}
      </div>
      <Link href={`/blog/${post.slug}`}>
        <LineWipeTitle
          text={post.title}
          hovered={hovered}
          textClassName="font-heading text-xl md:text-2xl leading-snug"
        />
      </Link>
      <Link
        href={`/blog/${post.slug}`}
        className="inline-flex items-center font-heading text-sm tracking-widest text-ink hover:text-muted transition-colors mt-4"
      >
        Read More
        <span className="group-hover:animate-[blink_0.8s_step-end_infinite]">_</span>
      </Link>
    </div>
  );
}
