import Image from "next/image";
import Link from "next/link";

type TextPanel = {
  type: "text";
  letter: string;
  heading: string[];
  body: string;
  cta: string;
  href: string;
};

type ImagePanel = {
  type: "image";
  src: string;
};

type Panel = TextPanel | ImagePanel;

const panels: Panel[] = [
  {
    type: "text",
    letter: "A",
    heading: ["We’re Always Looking", "For Great Minds."],
    body: "Creative, strategic, curious or technical — if you think differently and care about making strong work, we want to hear from you.",
    cta: "Join The Team",
    href: "/#contact",
  },
  { type: "image", src: "/images/misc/creative-1.webp" },
  {
    type: "text",
    letter: "B",
    heading: ["Let’s Talk.", "Build What’s Next."],
    body: "Have a project, challenge or idea in mind? Tell us where you want to go and we’ll bring the right minds together to make it happen.",
    cta: "Get In Touch",
    href: "/#contact",
  },
  { type: "image", src: "/images/misc/creative-2.webp" },
  {
    type: "text",
    letter: "C",
    heading: ["We Move Fast.", "We Work As One."],
    body: "Strategy, creative, digital, technology and execution come together in one team — fewer layers, sharper decisions and faster delivery.",
    cta: "How We Work",
    href: "/#services",
  },
  { type: "image", src: "/images/misc/creative-3.webp" },
];

export default function CreativeGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3">
      {panels.map((panel, i) =>
        panel.type === "image" ? (
          <div key={i} className="group relative h-[65vh] overflow-hidden bg-ink">
            <Image
              src={panel.src}
              alt=""
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            key={i}
            className="relative h-[65vh] overflow-hidden bg-surface flex items-center p-[105px]"
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-[calc(50%-50px)] -translate-x-1/2 -translate-y-1/2 font-heading font-semibold text-[24rem] leading-none text-hairline select-none pointer-events-none"
            >
              {panel.letter}
            </span>
            <div className="relative z-10">
              <h3 className="font-heading font-[600]! text-[35px] leading-tight mb-4">
                {panel.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <p className="text-muted text-[16px] max-w-xs mb-6 normal-case">{panel.body}</p>
              <Link
                href={panel.href}
                className="group/cta font-heading font-semibold text-sm uppercase tracking-widest inline-flex items-center gap-2 hover:text-muted transition-colors"
              >
                {panel.cta}
                <span
                  aria-hidden
                  className="transition-transform duration-300 ease-out group-hover/cta:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
