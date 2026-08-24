import SectionHeading from "@/components/SectionHeading";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import PortfolioMosaic from "@/components/PortfolioMosaic";
import NewsCard from "@/components/NewsCard";
import AwardCard from "@/components/AwardCard";
import TeamShowcase from "@/components/TeamShowcase";
import CreativeGrid from "@/components/CreativeGrid";
import ClientsLogoGrid from "@/components/ClientsLogoGrid";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import StatBlock from "@/components/StatBlock";
import AutoplayVideo from "@/components/AutoplayVideo";
import Accordion from "@/components/Accordion";
import PhoneMockup from "@/components/PhoneMockup";
import Newsletter from "@/components/Newsletter";
import OurWorkGrid from "@/components/OurWorkGrid";
import HomeContact from "@/components/HomeContact";
import HeroSlider from "@/components/HeroSlider";
import { Reveal } from "@/components/Reveal";
import { featuredWork } from "@/data/work";
import { posts } from "@/data/blog";
import { testimonials } from "@/data/testimonials";
import { stats } from "@/data/stats";
import { clients } from "@/data/clients";
import { workAccordion } from "@/data/process";
import { team } from "@/data/team";
import { awards } from "@/data/awards";

export default function Home() {
  return (
    <>
      <HeroSlider />

      {/* Capabilities */}
      <CapabilitiesGrid />

      {/* Portfolio teaser */}
      <section className="pb-20 md:pb-28">
        <Reveal delay={0.1}>
          <PortfolioMosaic items={featuredWork} />
        </Reveal>
      </section>

      {/* Latest News */}
      <section className="container-page py-20 md:py-28 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <Reveal>
          <SectionHeading
            title="NEWS"
            titleClassName="text-[70px]"
            underscoreClassName="animate-[color-blink_6s_steps(1)_infinite]"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-10">
            {posts.slice(0, 2).map((post) => (
              <NewsCard key={post.slug} post={post} />
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col gap-10">
            {posts.slice(2, 4).map((post) => (
              <NewsCard key={post.slug} post={post} />
            ))}
          </div>
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

      {/* Showcase video */}
      <section className="h-[75vh] w-full overflow-hidden">
        <AutoplayVideo src="/videos/generic-showcase.mp4" />
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
          <Reveal className="md:h-[420px] flex items-center justify-center">
            <PhoneMockup src="/images/misc/phone-showcase.jpg" />
          </Reveal>
          <Reveal delay={0.15}>
            <Accordion items={workAccordion} />
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Team */}
      <section className="border-t border-hairline">
        <Reveal delay={0.1}>
          <TeamShowcase members={team.slice(0, 4)} />
        </Reveal>
      </section>

      {/* Our Work */}
      <OurWorkGrid />

      {/* Creative grid */}
      <Reveal>
        <CreativeGrid />
      </Reveal>

      {/* Testimonials */}
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-page">
          <Reveal>
            <TestimonialsCarousel items={testimonials} />
          </Reveal>
        </div>
      </section>

      {/* Awards */}
      <section className="bg-surface py-20 md:py-28 border-t border-hairline">
        <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <Reveal>
          <SectionHeading
            title="Awards"
            titleClassName="text-[70px]"
            underscoreClassName="animate-[color-blink_6s_steps(1)_infinite]"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-10">
            {awards.slice(0, 3).map((award) => (
              <AwardCard key={award.title} award={award} />
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col gap-10">
            {awards.slice(3, 6).map((award) => (
              <AwardCard key={award.title} award={award} />
            ))}
          </div>
        </Reveal>
        </div>
      </section>

      {/* Contact */}
      <HomeContact />

      {/* Map */}
      <section className="h-[60vh] w-full">
        <iframe
          src="https://maps.google.com/maps?q=3%20Wakehurst%20Street%2C%20New%20York%2C%20NY%2010002&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Our location"
        />
      </section>
    </>
  );
}
