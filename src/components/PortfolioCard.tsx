import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/data/portfolio";

export default function PortfolioCard({ project }: { project: Project }) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-ink">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-500" />
        <div className="absolute inset-0 flex items-end p-6 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <span className="font-heading text-paper text-sm tracking-widest border border-paper/70 px-4 py-2">
            View Project _
          </span>
        </div>
      </div>
      <div className="text-sm text-muted mb-1">{project.tags.join(" / ")}</div>
      <h3 className="font-heading text-2xl group-hover:text-muted transition-colors">
        {project.title}
      </h3>
    </Link>
  );
}
