import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { posts } from "@/data/blog";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return { title: post ? `${post.title} — Boldlab` : "Blog — Boldlab" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const post = posts[index];
  const next = posts[(index + 1) % posts.length];
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <section className="container-page pt-16 pb-8 md:pt-24">
        <Reveal>
          <div className="text-sm text-muted mb-4">
            {post.category}
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl mb-6">{post.title}</h1>
          <div className="text-sm text-muted">
            By {post.author} — {date}
          </div>
        </Reveal>
      </section>

      <Reveal className="container-page pb-16 block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      </Reveal>

      <Reveal delay={0.1} className="container-page pb-20 md:pb-28 max-w-2xl block">
        {post.content.map((paragraph, i) => (
          <p key={i} className="text-muted normal-case text-lg mb-6">
            {paragraph}
          </p>
        ))}
      </Reveal>

      <section className="border-t border-hairline">
        <Link
          href={`/blog/${next.slug}`}
          className="container-page py-12 flex items-center justify-between group"
        >
          <div>
            <div className="text-sm text-muted mb-1">Next Post</div>
            <div className="font-heading text-3xl group-hover:text-muted transition-colors">
              {next.title}
            </div>
          </div>
          <span className="font-heading text-2xl transition-transform group-hover:translate-x-2">_</span>
        </Link>
      </section>
    </>
  );
}
