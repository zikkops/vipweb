import Image from "next/image";
import Link from "next/link";
import { capabilities } from "@/data/services";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export default function CapabilitiesGrid() {
  return (
    <section className="min-h-screen flex items-center py-12">
      <div className="container-page">
        <Reveal>
          <p className="font-heading font-semibold uppercase text-[13px] tracking-[0.25em] text-accent mb-4">
            Built For End-To-End Impact_
          </p>
          <h2 className="text-[32px] md:text-[42px] leading-[1.08] mb-4">
            <span className="block">Strategy. Creativity. Execution.</span>
            <span className="block">All Working Together Under One Roof.</span>
          </h2>
          <p className="text-muted text-[15px] normal-case leading-relaxed max-w-lg mb-8">
            From the spark of an idea to its launch and beyond, we deliver everything brands need to
            grow, connect and win.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((c) => (
            <RevealItem key={c.number} className="h-full">
              <Link
                href={c.href}
                className="group flex h-full items-center gap-4 bg-surface p-5 transition-colors duration-300 hover:bg-hairline"
              >
                <div className="shrink-0 w-[72px] md:w-[84px]">
                  <Image
                    src={c.icon}
                    alt=""
                    width={168}
                    height={168}
                    sizes="84px"
                    className="w-full h-auto"
                  />
                </div>
                <div>
                  <span className="block font-heading text-[13px] tracking-[0.2em] text-accent mb-1">
                    {c.number}
                  </span>
                  <h3 className="font-heading font-semibold uppercase text-[20px] md:text-[22px] leading-[1.1]">
                    {c.title.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h3>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center">
            <p className="font-heading font-semibold uppercase text-[16px] tracking-[0.12em] text-ink">
              One Team. Every Discipline. Real Results.
            </p>
            <span aria-hidden className="mt-2 block h-[3px] w-[100px] bg-accent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
