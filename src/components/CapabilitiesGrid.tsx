import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import { capabilities } from "@/data/services";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { SECTION_TITLE_CLASS, SECTION_UNDERSCORE_CLASS } from "@/lib/section";

export default function CapabilitiesGrid() {
  return (
    <section id="services" className="min-h-screen flex items-center py-12 scroll-mt-20">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            title="Our Services"
            titleClassName={SECTION_TITLE_CLASS}
            underscoreClassName={SECTION_UNDERSCORE_CLASS}
          />
          <p className="mt-6 font-heading font-semibold uppercase text-[24px] md:text-[32px] leading-[1.12] mb-4">
            <span className="block">Strategy. Creativity. Execution.</span>
            <span className="block">All Working Together Under One Roof.</span>
          </p>
          <p className="text-muted text-[15px] normal-case leading-relaxed max-w-lg mb-8">
            From the spark of an idea to its launch and beyond, we deliver everything brands need to
            grow, connect and win.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((c) => (
            <RevealItem key={c.number} className="h-full">
              <div className="group flex h-full items-center gap-4 bg-surface p-5 transition-colors duration-300 hover:bg-hairline">
                <div className="shrink-0 w-[64px] sm:w-[72px] md:w-[84px]">
                  <Image
                    src={c.icon}
                    alt=""
                    width={168}
                    height={168}
                    sizes="84px"
                    className="w-full h-auto"
                  />
                </div>
                <div className="min-w-0">
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
              </div>
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
