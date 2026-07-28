import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";
import PortfolioMosaic from "@/components/PortfolioMosaic";
import BlogCard from "@/components/BlogCard";
import NewsCard from "@/components/NewsCard";
import TeamShowcase from "@/components/TeamShowcase";
import CreativeGrid from "@/components/CreativeGrid";
import ClientsLogoGrid from "@/components/ClientsLogoGrid";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import StatBlock from "@/components/StatBlock";
import Accordion from "@/components/Accordion";
import HeroSlider from "@/components/HeroSlider";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { coreServices } from "@/data/services";
import { projects } from "@/data/portfolio";
import { posts } from "@/data/blog";
import { testimonials } from "@/data/testimonials";
import { stats } from "@/data/stats";
import { clients } from "@/data/clients";
import { workAccordion } from "@/data/process";
import { team } from "@/data/team";

export default function Home() {
  return (
    <>
      <HeroSlider />

      {/* Services strip */}
      <section className="border-y border-hairline">
        <RevealGroup className="container-page grid grid-cols-2 md:grid-cols-4">
          {coreServices.map((s, i) => (
            <RevealItem
              key={s.title}
              className={`py-10 px-4 ${i !== 0 ? "border-l border-hairline" : ""}`}
            >
              <h3 className="font-heading text-2xl mb-2">{s.title}</h3>
              <p className="text-muted text-sm normal-case">{s.short}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Portfolio teaser */}
      <section className="py-20 md:py-28">
        <Reveal className="container-page">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <SectionHeading eyebrow="Selected Work" title="Recent Projects" />
            <Link href="/portfolio" className="font-heading text-sm tracking-widest hover:text-muted transition-colors">
              View All Work _
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <PortfolioMosaic projects={projects} />
        </Reveal>
      </section>

      {/* Stats */}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatBlock key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </section>

      {/* Clients */}
      <section className="bg-surface py-16">
        <div className="container-page">
          <Reveal>
            <SectionHeading title="Our Clients" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <ClientsLogoGrid clients={clients} />
          </Reveal>
        </div>
      </section>

      {/* Creative grid */}
      <Reveal>
        <CreativeGrid />
      </Reveal>

      {/* Way we work */}
      <section className="container-page py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <Reveal>
          <div>
            <SectionHeading eyebrow="Process" title="The Way We Work" />
            <p className="text-muted mt-6 max-w-md normal-case">
              No account layers, no scope surprises. Every engagement runs with
              a small, senior team from kickoff to launch.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <Accordion items={workAccordion} />
        </Reveal>
      </section>

      {/* Latest News */}
      <section className="container-page py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12 items-start border-t border-hairline">
        <Reveal>
          <div>
            <SectionHeading eyebrow="Journal" title="Latest News" />
            <p className="text-muted mt-6 max-w-md normal-case">
              Ideas, process notes, and the occasional strong opinion, straight
              from the team doing the work.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            {posts.slice(0, 4).map((post) => (
              <NewsCard key={post.slug} post={post} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Team */}
      <section className="py-20 md:py-28 border-t border-hairline">
        <Reveal className="container-page">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <SectionHeading eyebrow="The People" title="Meet The Team" />
            <Link href="/team" className="font-heading text-sm tracking-widest hover:text-muted transition-colors">
              View Full Team _
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <TeamShowcase members={team.slice(0, 4)} />
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Testimonials" title="What Clients Say" align="center" />
          </Reveal>
          <div className="mt-12">
            <TestimonialsCarousel items={testimonials} />
          </div>
        </div>
      </section>

      {/* Blog teaser */}
      <section className="container-page py-20 md:py-28">
        <Reveal>
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <SectionHeading eyebrow="Journal" title="From The Blog" />
            <Link href="/blog" className="font-heading text-sm tracking-widest hover:text-muted transition-colors">
              View All Posts _
            </Link>
          </div>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.slice(0, 3).map((post) => (
            <RevealItem key={post.slug}>
              <BlogCard post={post} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/misc/cta.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <Reveal className="relative container-page text-paper text-center w-full">
          <h2 className="text-4xl md:text-6xl mb-8">
            Let&apos;s Build Something Bold_
          </h2>
          <Button href="/contact" variant="light">Get In Touch</Button>
        </Reveal>
      </section>
    </>
  );
}
