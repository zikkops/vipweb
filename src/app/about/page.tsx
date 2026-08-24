import Link from "next/link";
import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import TeamCard from "@/components/TeamCard";
import Accordion from "@/components/Accordion";
import Button from "@/components/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { team } from "@/data/team";
import { workAccordion } from "@/data/process";

export const metadata = {
  title: "About Us — VIPMINDS",
};

export default function AboutPage() {
  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="font-heading text-sm tracking-[0.3em] text-muted mb-4">
            About Us
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            We&apos;re A Small Studio That Punches Above Its Size_
          </h1>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/misc/about-us.jpg"
              alt="VIPMINDS studio"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-muted normal-case text-lg mb-4">
            VIPMINDS started as a two-person design shop in 2016 and has grown
            into a full-service creative agency without losing the parts that
            made the work good in the first place: small teams, direct
            communication, and a genuine obsession with craft.
          </p>
          <p className="text-muted normal-case text-lg">
            Today we work with founders, marketing leads, and product teams
            who need brand, web, and campaign work that actually moves the
            needle — not just another deck of concepts.
          </p>
        </Reveal>
      </section>


      <section className="container-page py-20 md:py-28">
        <Reveal>
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <SectionHeading eyebrow="The People" title="Meet The Team" />
            <Link href="/team" className="font-heading text-sm tracking-widest hover:text-muted transition-colors">
              View Full Team _
            </Link>
          </div>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {team.slice(0, 4).map((member) => (
            <RevealItem key={member.slug}>
              <TeamCard member={member} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="container-page py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12">
        <Reveal>
          <SectionHeading eyebrow="Process" title="How We Work" />
        </Reveal>
        <Reveal delay={0.15}>
          <Accordion items={workAccordion} />
        </Reveal>
      </section>

      <section className="border-t border-hairline">
        <Reveal className="container-page py-20 md:py-28 text-center block">
          <h2 className="text-3xl md:text-5xl mb-8 max-w-2xl mx-auto">
            Interested To Work And Cooperate With Us?_
          </h2>
          <Button href="/contact">Hire Us</Button>
        </Reveal>
      </section>
    </>
  );
}
