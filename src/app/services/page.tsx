import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import Button from "@/components/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";

export const metadata = {
  title: `Our Services — ${site.name}`,
};

export default function ServicesPage() {
  return (
    <>
      {/* Intro */}
      <section className="container-page pt-16 pb-16 md:pt-24 md:pb-24">
        <Reveal>
          <p className="font-heading font-semibold uppercase text-[13px] tracking-[0.25em] text-accent mb-5">
            Our Services_
          </p>
          <h1 className="text-[38px] md:text-[58px] leading-[1.06] mb-8">
            <span className="block">Strategy, Creativity And Execution.</span>
            <span className="block">Built To Work As One.</span>
          </h1>
          <div className="max-w-2xl space-y-5 text-muted text-[17px] normal-case leading-relaxed">
            <p>
              From shaping the opportunity to building the brand, launching it and keeping it
              relevant, {site.name} brings strategy, creative, technology and communication together
              under one roof.
            </p>
            <p>
              We build ideas that can move across every touchpoint — brand, campaign, content,
              experience and platform — without losing consistency along the way.
            </p>
          </div>
        </Reveal>
      </section>

      {/* The six services */}
      <section className="container-page pb-20 md:pb-28">
        <RevealGroup className="border-t border-hairline">
          {services.map((service) => (
            <RevealItem
              key={service.slug}
              className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-12 border-b border-hairline py-12 md:py-16"
            >
              <div>
                <span className="font-heading text-[15px] tracking-[0.2em] text-accent">
                  {service.number}
                </span>
                <h2 className="font-heading font-semibold uppercase text-[28px] md:text-[32px] leading-[1.1] mt-2">
                  {service.title}
                </h2>
              </div>

              <div>
                <h3 className="font-heading font-semibold uppercase text-[22px] md:text-[26px] leading-[1.15] mb-4">
                  {service.tagline}
                </h3>
                <p className="text-muted text-[16px] normal-case leading-relaxed max-w-2xl mb-8">
                  {service.description}
                </p>

                <p className="font-heading font-semibold uppercase text-[13px] tracking-[0.2em] text-ink mb-4">
                  Our Capabilities
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
                  {service.capabilities.map((c) => (
                    <li
                      key={c}
                      className="text-[15px] normal-case flex items-start gap-3 border-b border-hairline py-2"
                    >
                      <span className="text-accent shrink-0">—</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Closing statement */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <h2 className="text-[32px] md:text-[46px] leading-[1.08] mb-8 max-w-3xl">
              One Team. Every Discipline. Real Results.
            </h2>
            <p className="text-muted text-[17px] normal-case leading-relaxed max-w-2xl mb-10">
              The advantage is not simply having different capabilities under one roof. It is having
              them work together.
            </p>

            <ul className="font-heading uppercase text-[20px] md:text-[24px] leading-[1.5] mb-10">
              <li>Strategy informs creative.</li>
              <li>Creative shapes the experience.</li>
              <li>Technology makes it work.</li>
              <li>Communication takes it to market.</li>
              <li>Data tells us what comes next.</li>
            </ul>

            <p className="font-heading font-semibold uppercase text-[19px] md:text-[22px] leading-[1.3] max-w-2xl">
              From the first idea to what happens after launch, we stay connected to the whole
              journey.
            </p>
            <span aria-hidden className="mt-6 block h-[3px] w-[112px] bg-accent" />
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-page">
          <TestimonialsCarousel items={testimonials} />
        </div>
      </section>

      <Reveal className="container-page py-20 md:py-28 text-center block">
        <h2 className="text-3xl md:text-5xl mb-8 max-w-2xl mx-auto">
          Not Sure Which Service You Need?_
        </h2>
        <Button href="/contact">Talk To Us</Button>
      </Reveal>
    </>
  );
}
