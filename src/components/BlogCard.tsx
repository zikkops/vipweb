import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/data/blog";

export default function BlogCard({ post }: { post: Post }) {
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[16/10] mb-4 overflow-hidden bg-ink">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      </div>
      <div className="text-sm text-muted mb-1">
        {post.category} — {date}
      </div>
      <h3 className="font-heading text-2xl mb-2 group-hover:text-muted transition-colors">
        {post.title}
      </h3>
      <p className="text-muted text-sm">{post.excerpt}</p>
    </Link>
  );
}
