import BlogCard from "@/components/BlogCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { posts } from "@/data/blog";

export const metadata = {
  title: "Blog — VIPMINDS",
};

export default function BlogPage() {
  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="font-heading text-sm tracking-[0.3em] text-muted mb-4">
            Journal
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Notes On Design, Strategy, And Craft_
          </h1>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((post) => (
            <RevealItem key={post.slug}>
              <BlogCard post={post} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
