export type Service = {
  number: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
};

export const coreServices = [
  { title: "Design", short: "Identity systems built to last.", icon: "/images/services/icon-1.svg" },
  { title: "Branding", short: "Positioning, voice, and visual language.", icon: "/images/services/icon-2.svg" },
  { title: "Advertising", short: "Campaigns that earn attention.", icon: "/images/services/icon-3.svg" },
  { title: "Copywriting", short: "Words that move people to act.", icon: "/images/services/icon-4.svg" },
];

export const services: Service[] = [
  {
    number: "01",
    slug: "product-development",
    title: "Product Development",
    tagline: "From Opportunity To Market.",
    description:
      "We help turn ideas into products, services and experiences people actually want. From identifying the opportunity to defining the offer and preparing it for launch, we connect commercial thinking with brand and customer experience.",
    capabilities: [
      "Market & opportunity assessment",
      "Product and service strategy",
      "Concept development",
      "Customer journey development",
      "Value proposition",
      "Product naming",
      "Go-to-market planning",
      "Launch strategy",
    ],
  },
  {
    number: "02",
    slug: "brand-strategy",
    title: "Brand Strategy",
    tagline: "Build The Thinking Before The Brand.",
    description:
      "Strong brands start with clarity. We define what the brand stands for, where it belongs in the market and how it should show up to the people it wants to reach.",
    capabilities: [
      "Brand positioning",
      "Brand architecture",
      "Audience definition",
      "Competitive landscape",
      "Brand purpose & values",
      "Brand personality",
      "Messaging framework",
      "Naming & verbal strategy",
      "Communication strategy",
      "Brand launch & rollout planning",
    ],
  },
  {
    number: "03",
    slug: "visual-identity",
    title: "Visual Identity",
    tagline: "Make The Brand Impossible To Confuse.",
    description:
      "We translate strategy into a distinctive visual system designed to work everywhere — from a screen to a storefront, a campaign to a package.",
    capabilities: [
      "Logo design",
      "Visual identity systems",
      "Typography & color systems",
      "Brand guidelines",
      "Art direction",
      "Packaging",
      "Corporate collateral",
      "Retail & environmental branding",
      "Campaign identity",
      "Brand applications",
    ],
  },
  {
    number: "04",
    slug: "social-media",
    title: "Social Media",
    tagline: "Content With A Reason To Exist.",
    description:
      "We build social ecosystems around strategy, not posting schedules. From always-on communication to launches, campaigns and creator collaborations, every piece of content has a role.",
    capabilities: [
      "Social media strategy",
      "Content strategy",
      "Editorial planning",
      "Creative concepts",
      "Content creation",
      "Reels & short-form video",
      "Photography & production",
      "Community management",
      "Influencer collaborations",
      "Paid social campaigns",
      "Reporting & optimization",
    ],
  },
  {
    number: "05",
    slug: "pr-and-awards",
    title: "PR & Awards",
    tagline: "Build Visibility. Earn Credibility.",
    description:
      "We help brands move beyond advertising by creating stories, moments and achievements worth talking about — across media, industry platforms and award stages.",
    capabilities: [
      "PR strategy",
      "Media relations",
      "Press releases",
      "Corporate communications",
      "Launch communication",
      "Influencer & creator relations",
      "Event PR",
      "Media partnerships",
      "Thought leadership",
      "Award strategy",
      "Award submissions",
      "Case study development",
    ],
  },
  {
    number: "06",
    slug: "digital-experience",
    title: "Digital Experience",
    tagline: "Digital That Works As Good As It Looks.",
    description:
      "We design connected digital experiences that make brands easier to discover, use and engage with. Strategy, UX, design and technology work together from the start.",
    capabilities: [
      "Digital strategy",
      "Website strategy & development",
      "E-commerce",
      "UX/UI design",
      "Mobile applications",
      "Digital platforms",
      "CRM & customer journeys",
      "Marketing automation",
      "SEO",
      "Performance marketing",
      "Analytics & reporting",
      "Digital transformation",
    ],
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
