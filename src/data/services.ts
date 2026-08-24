export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  points: string[];
};

export const coreServices = [
  { title: "Design", short: "Identity systems built to last.", icon: "/images/services/icon-1.svg" },
  { title: "Branding", short: "Positioning, voice, and visual language.", icon: "/images/services/icon-2.svg" },
  { title: "Advertising", short: "Campaigns that earn attention.", icon: "/images/services/icon-3.svg" },
  { title: "Copywriting", short: "Words that move people to act.", icon: "/images/services/icon-4.svg" },
];

export const services: Service[] = [
  {
    slug: "brand-identity",
    title: "Brand Identity",
    short: "Logos, systems, and guidelines that hold up everywhere.",
    description:
      "We build brand identities from the ground up — strategy, naming, logo systems, color, type, and the guidelines that keep it all consistent as you grow.",
    points: ["Brand strategy", "Logo & visual identity", "Brand guidelines", "Naming"],
  },
  {
    slug: "web-product-design",
    title: "Web & Product Design",
    short: "Interfaces designed to convert and built to ship.",
    description:
      "From marketing sites to full product interfaces, we design and build experiences that are fast, accessible, and genuinely easy to use.",
    points: ["UX/UI design", "Design systems", "Front-end development", "Webflow & Next.js builds"],
  },
  {
    slug: "advertising",
    title: "Advertising Campaigns",
    short: "Ideas built for the channels that matter to you.",
    description:
      "We plan and produce campaigns across digital, print, and out-of-home — grounded in a single idea strong enough to travel across every format.",
    points: ["Campaign strategy", "Art direction", "Media planning", "Performance creative"],
  },
  {
    slug: "copywriting-content",
    title: "Copywriting & Content",
    short: "Copy that sounds like you, written to convert.",
    description:
      "Website copy, campaign lines, product content, and long-form storytelling — all written to match how your brand actually talks.",
    points: ["Website copy", "Content strategy", "Editorial & blog", "Social copy"],
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    short: "Growth strategy backed by data, not guesswork.",
    description:
      "SEO, paid media, and lifecycle marketing programs built to compound — with reporting that tells you exactly what's working.",
    points: ["SEO", "Paid media", "Email & lifecycle", "Analytics & reporting"],
  },
  {
    slug: "motion-video",
    title: "Motion & Video",
    short: "Motion design and video that make ideas move.",
    description:
      "From product explainers to brand films, we handle concept, shoot, and post to bring a static brand to life on screen.",
    points: ["Brand films", "Motion graphics", "Product explainers", "Social video"],
  },
];

export type Capability = {
  number: string;
  title: string[];
  body: string;
  icon: string;
  href: string;
};

export const capabilities: Capability[] = [
  {
    number: "01",
    title: ["Product", "Development"],
    body: "From idea to market-ready product.",
    icon: "/images/services/icon-product-development.png",
    href: "/services",
  },
  {
    number: "02",
    title: ["Brand", "Strategy"],
    body: "Positioning brands to launch, scale and win.",
    icon: "/images/services/icon-brand-strategy.png",
    href: "/services",
  },
  {
    number: "03",
    title: ["Visual", "Identity"],
    body: "Distinctive identities built for recognition.",
    icon: "/images/services/icon-visual-identity.png",
    href: "/services",
  },
  {
    number: "04",
    title: ["Social", "Media"],
    body: "Content, storytelling and always-on brand presence.",
    icon: "/images/services/icon-social-media.png",
    href: "/services",
  },
  {
    number: "05",
    title: ["PR &", "Awards"],
    body: "Building visibility, credibility and recognition.",
    icon: "/images/services/icon-pr-awards.png",
    href: "/services",
  },
  {
    number: "06",
    title: ["Digital", "Experience"],
    body: "Websites, platforms and digital experiences built for impact.",
    icon: "/images/services/icon-digital-experience.png",
    href: "/services",
  },
];
