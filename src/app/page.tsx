import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import AboutIntro from "@/components/AboutIntro";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import PortfolioMosaic from "@/components/PortfolioMosaic";
import CreativeGrid from "@/components/CreativeGrid";
import ClientsLogoGrid from "@/components/ClientsLogoGrid";
import StatBlock from "@/components/StatBlock";
import Accordion from "@/components/Accordion";
import Newsletter from "@/components/Newsletter";
import OurWorkGrid from "@/components/OurWorkGrid";
import HomeContact from "@/components/HomeContact";
import HeroSlider from "@/components/HeroSlider";
import { Reveal } from "@/components/Reveal";
import { featuredWork } from "@/data/work";
import { stats } from "@/data/stats";
import { clients } from "@/data/clients";
import { workAccordion } from "@/data/process";

export default function Home() {
  return (
    <>
      <HeroSlider />

      {/* About */}
      <AboutIntro />

      {/* Capabilities */}
      <CapabilitiesGrid />

      {/* Portfolio teaser */}
      <section id="portfolio" className="pb-20 md:pb-28 scroll-mt-20">
        <Reveal delay={0.1}>
          <PortfolioMosaic items={featuredWork} />
        </Reveal>
      </section>

      {/* Stats */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatBlock key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </section>

      {/* Clients */}
      <section className="bg-paper py-16">
        <div className="container-page">
          <Reveal>
            <SectionHeading title="Our Clients" titleClassName="text-[70px]" underscoreClassName="animate-[color-blink_6s_steps(1)_infinite]" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <ClientsLogoGrid clients={clients} />
          </Reveal>
        </div>
      </section>

      {/* Way we work */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page grid grid-cols-1 md:grid-cols-2 gap-[100px] items-start">
          <Reveal className="relative md:h-[420px] aspect-[16/9] md:aspect-auto overflow-hidden block">
            <Image
              src="/images/misc/how-we-work.webp"
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={0.15}>
            <Accordion items={workAccordion} />
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Our Work */}
      <OurWorkGrid />

      {/* Creative grid */}
      <Reveal>
        <CreativeGrid />
      </Reveal>

      {/* Contact */}
      <HomeContact />

      {/* Map */}
      <section className="h-[60vh] w-full">
        <iframe
          src="https://maps.google.com/maps?q=8890%20Spanish%20Ridge%20Ave%2C%20Las%20Vegas%2C%20NV%2089148&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Our location"
        />
      </section>
    </>
  );
}
