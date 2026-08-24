import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";

export default function AboutIntro() {
  return (
    <section id="about" className="container-page py-20 md:py-28 scroll-mt-20">
      <Reveal>
        <p className="font-heading font-semibold uppercase text-[13px] tracking-[0.25em] text-accent mb-5">
          About Us_
        </p>

        <h2 className="text-[32px] md:text-[46px] leading-[1.08] mb-8 max-w-4xl">
          {site.name}{" "}
          Is An American Lebanese Agency With Roots In Beirut And Boots On The Ground In Beverly
          Hills &amp; Las Vegas.
        </h2>

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
