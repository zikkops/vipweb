import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";
import { SECTION_TITLE_CLASS, SECTION_UNDERSCORE_CLASS } from "@/lib/section";

export default function AboutIntro() {
  return (
    <section id="about" className="container-page py-20 md:py-28 scroll-mt-20">
      <Reveal>
        <SectionHeading
          title="About Us"
          titleClassName={SECTION_TITLE_CLASS}
          underscoreClassName={SECTION_UNDERSCORE_CLASS}
        />

        <p className="mt-8 font-heading font-semibold uppercase text-[24px] md:text-[32px] leading-[1.12] mb-8 max-w-4xl">
          {site.name}{" "}
          Is An American Lebanese Agency With Roots In Beirut And Boots On The Ground In Beverly
          Hills &amp; Las Vegas.
        </p>

        <div className="max-w-2xl space-y-5 text-muted text-[17px] normal-case leading-relaxed">
          <p>We&rsquo;re a creative engine built to take ideas all the way through to execution.</p>
          <p>
            From global brand launches to the everyday rhythm of storytelling, we run the process
            from start to finish.
          </p>
          <p>
            Have a spark of an idea? We shape it, scale it, and launch it with strategy, creativity,
            social, experiential, and PR all working together under one roof.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
