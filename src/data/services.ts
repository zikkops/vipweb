
export type Capability = {
  number: string;
  title: string[];
  body: string;
  icon: string;
};

export const capabilities: Capability[] = [
  {
    number: "01",
    title: ["Product", "Development"],
    body: "From idea to market-ready product.",
    icon: "/images/services/icon-product-development.png",
  },
  {
    number: "02",
    title: ["Brand", "Strategy"],
    body: "Positioning brands to launch, scale and win.",
    icon: "/images/services/icon-brand-strategy.png",
  },
  {
    number: "03",
    title: ["Visual", "Identity"],
    body: "Distinctive identities built for recognition.",
    icon: "/images/services/icon-visual-identity.png",
  },
  {
    number: "04",
    title: ["Social", "Media"],
    body: "Content, storytelling and always-on brand presence.",
    icon: "/images/services/icon-social-media.png",
  },
  {
    number: "05",
    title: ["PR &", "Awards"],
    body: "Building visibility, credibility and recognition.",
    icon: "/images/services/icon-pr-awards.png",
  },
  {
    number: "06",
    title: ["Digital", "Experience"],
    body: "Websites, platforms and digital experiences built for impact.",
    icon: "/images/services/icon-digital-experience.png",
  },
];
