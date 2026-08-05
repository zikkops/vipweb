import SectionHeading from "@/components/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

const items = [
  {
    number: "01",
    lines: ["Get In Touch.", "Start A Project."],
    description:
      "Have a project in mind? Tell us where you're headed and we'll tell you how we'd get you there.",
  },
  {
    number: "02",
    lines: ["See Our Work.", "Recent Projects."],
    description:
      "A look at the brands, sites, and campaigns we've shipped for clients who wanted to stand out.",
  },
  {
    number: "03",
    lines: ["Meet The Team.", "The People Behind It."],
    description:
      "Small, senior, and hands-on — get to know the people who'll actually be doing the work.",
  },
  {
    number: "FAQ",
    lines: ["Ask Anything.", "Learn Everything."],
    description:
      "Answers to the questions we get asked most, from timelines and pricing to how we structure work.",
  },
];

export default function OurWorkGrid() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12">
        <Reveal>
          <SectionHeading
            title="Our Work"
            titleClassName="text-[70px] font-normal whitespace-nowrap"
            underscoreClassName="animate-[color-blink_6s_steps(1)_infinite]"
          />
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-16">
          {items.map((item) => (
            <RevealItem key={item.number} className="relative">
              <span
                aria-hidden
                className="absolute -top-2 left-0 font-heading font-semibold text-[220px] leading-none text-hairline select-none pointer-events-none"
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
