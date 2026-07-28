import Image from "next/image";
import Link from "next/link";

type TextPanel = {
  type: "text";
  letter: string;
  heading: string[];
  body: string;
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
    heading: ["We Hire Creatives", "Are You Creative?"],
    body: "We're always looking for people who care about the work as much as we do.",
    href: "/contact",
  },
  { type: "image", src: "/images/misc/creative-1.jpg" },
  {
    type: "text",
    letter: "B",
    heading: ["Get In Touch.", "Think Way Ahead."],
    body: "Got a brief, a rough idea, or just a question? We'd like to hear it.",
    href: "/contact",
  },
  { type: "image", src: "/images/misc/creative-2.jpg" },
  {
    type: "text",
    letter: "C",
    heading: ["We Move Fast.", "Ideas Ship Weekly."],
    body: "Small senior team, short feedback loops, no layers of approval.",
    href: "/about",
  },
  { type: "image", src: "/images/misc/creative-3.jpg" },
];

export default function CreativeGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3">
      {panels.map((panel, i) =>
        panel.type === "image" ? (
          <div key={i} className="group relative h-[320px] sm:h-[420px] overflow-hidden bg-ink">
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
            className="relative h-[320px] sm:h-[420px] overflow-hidden bg-surface flex items-center px-8 md:px-10"
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[20rem] leading-none text-hairline select-none pointer-events-none"
            >
              {panel.letter}
            </span>
            <div className="relative z-10">
              <h3 className="font-heading text-2xl leading-tight mb-4">
                {panel.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <p className="text-muted text-sm max-w-xs mb-6 normal-case">{panel.body}</p>
              <Link
                href={panel.href}
                className="font-heading text-sm tracking-widest hover:text-muted transition-colors"
              >
                Read More _
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
