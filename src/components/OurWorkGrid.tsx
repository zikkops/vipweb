import SectionHeading from "@/components/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

const items = [
  {
    number: "01",
    lines: ["Start A Project.", "Let’s Create Something."],
    description:
      "Have a challenge, idea or opportunity? We bring strategy, creativity, technology and execution together to make it happen.",
  },
  {
    number: "02",
    lines: ["See Our Work.", "Explore Our Projects."],
    description:
      "Discover the brands, campaigns, platforms and experiences we’ve created across industries and markets.",
  },
  {
    number: "03",
    lines: ["Meet The Team.", "The Minds Behind It."],
    description:
      "Strategists, creatives, technologists and makers working together from idea to execution.",
  },
  {
    number: "04",
    lines: ["Ask Anything.", "Get To Know Us."],
    description:
      "Explore how we work, what we do and how we can build the right solution for your business.",
  },
];

export default function OurWorkGrid() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12">
        <Reveal>
          <SectionHeading
            title="Our Work"
            titleClassName="text-[44px] sm:text-[56px] lg:text-[70px] font-normal whitespace-nowrap"
            underscoreClassName="animate-[color-blink_6s_steps(1)_infinite]"
          />
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-16">
          {items.map((item) => (
            <RevealItem key={item.number} className="relative">
              <span
                aria-hidden
                className="absolute top-[52px] lg:top-[69px] left-0 lg:left-[-14px] font-heading font-bold text-[150px] lg:text-[250px] leading-[25px] text-hairline select-none pointer-events-none"
              >
                {item.number}
              </span>
              <div className="relative pt-16 pl-[20px]">
                <h3 className="text-[26px] font-normal leading-tight mb-4">
                  {item.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="text-muted text-[16px] normal-case max-w-xs">{item.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
