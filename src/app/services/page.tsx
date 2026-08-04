import SectionHeading from "@/components/SectionHeading";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import Button from "@/components/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";
import { clients } from "@/data/clients";

export const metadata = {
  title: "Our Services — Boldlab",
};

export default function ServicesPage() {
  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="font-heading text-sm tracking-[0.3em] text-muted mb-4">
            Our Services
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            Brand, Web, And Advertising Work Under One Roof_
          </h1>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
          {services.map((service) => (
            <RevealItem key={service.slug} className="bg-paper p-8 md:p-10">
              <h2 className="font-heading text-2xl md:text-3xl mb-3">{service.title}</h2>
              <p className="text-muted normal-case mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.points.map((p) => (
                  <li key={p} className="text-sm flex items-center gap-2">
                    <span className="text-muted">—</span> {p}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

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

      <section className="py-16 border-b border-hairline">
        <div className="container-page">
          <Reveal>
            <div className="font-heading text-sm tracking-[0.3em] text-muted mb-8 text-center">
              OUR CLIENTS
            </div>
          </Reveal>
          <RevealGroup className="flex flex-wrap justify-center gap-x-10 gap-y-6">
            {clients.map((c) => (
              <RevealItem key={c.name}>
                <span className="font-heading text-lg md:text-xl text-muted-light">
                  {c.name}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
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
