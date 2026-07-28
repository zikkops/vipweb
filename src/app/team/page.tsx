import TeamCard from "@/components/TeamCard";
import Button from "@/components/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { team } from "@/data/team";

export const metadata = {
  title: "Our Team — Boldlab",
};

export default function TeamPage() {
  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <Reveal>
          <div className="font-heading text-sm tracking-[0.3em] text-muted mb-4">
            Our Team
          </div>
          <h1 className="text-4xl md:text-6xl max-w-3xl">
            The People Behind The Work_
          </h1>
        </Reveal>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {team.map((member) => (
            <RevealItem key={member.slug}>
              <TeamCard member={member} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="border-t border-hairline">
        <Reveal className="container-page py-20 md:py-28 text-center block">
          <h2 className="text-3xl md:text-5xl mb-8 max-w-2xl mx-auto">
            We Hire Creatives. Are You Creative?_
          </h2>
          <Button href="/contact">Get In Touch</Button>
        </Reveal>
      </section>
    </>
  );
}
