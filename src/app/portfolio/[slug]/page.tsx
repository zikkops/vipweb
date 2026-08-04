import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import Lightbox from "@/components/Lightbox";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/data/portfolio";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project ? `${project.title} — Boldlab` : "Project — Boldlab" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="text-sm text-muted mb-4">
            {project.tags.join(" / ")} — {project.year}
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">{project.title}_</h1>
        </Reveal>
      </section>

      <Reveal className="container-page pb-16 block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      </Reveal>

      <section className="container-page pb-16 md:pb-20 grid grid-cols-1 md:grid-cols-3 gap-12">
        <Reveal className="md:col-span-2 block">
          <h2 className="font-heading text-2xl mb-4">Overview</h2>
          <p className="text-muted normal-case text-lg">{project.description}</p>
        </Reveal>
        <Reveal delay={0.1} className="space-y-6 block">
          <div>
            <div className="text-sm text-muted mb-1">Client</div>
            <div className="font-heading text-lg">{project.client}</div>
          </div>
          <div>
            <div className="text-sm text-muted mb-1">Year</div>
            <div className="font-heading text-lg">{project.year}</div>
          </div>
          <div>
            <div className="text-sm text-muted mb-1">Services</div>
            <ul>
              {project.services.map((s) => (
                <li key={s} className="font-heading text-lg">{s}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <Reveal>
          <h2 className="font-heading text-2xl mb-6">Gallery</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Lightbox images={project.gallery} alt={project.title} />
        </Reveal>
      </section>

      <section className="border-t border-hairline">
        <Link
          href={`/portfolio/${next.slug}`}
          className="container-page py-12 flex items-center justify-between group"
        >
          <div>
            <div className="text-sm text-muted mb-1">Next Project</div>
            <div className="font-heading text-3xl group-hover:text-muted transition-colors">
              {next.title}
            </div>
          </div>
          <span className="font-heading text-2xl transition-transform group-hover:translate-x-2">_</span>
        </Link>
      </section>

      <Reveal className="container-page py-20 text-center block">
        <Button href="/contact">Start A Similar Project</Button>
      </Reveal>
    </>
  );
}
