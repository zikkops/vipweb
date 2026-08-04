export type Project = {
  slug: string;
  title: string;
  tags: string[];
  client: string;
  year: string;
  services: string[];
  image: string;
  gallery: string[];
  summary: string;
  description: string;
  color: string;
};

export const allTags = [
  "Branding",
  "Web Design",
  "Advertising",
  "Motion",
  "Print",
];

export const projects: Project[] = [
  {
    slug: "make-things-happen",
    image: "/images/portfolio/make-things-happen.jpg",
    gallery: ["/images/portfolio/make-things-happen-2.jpg", "/images/portfolio/make-things-happen-3.jpg"],
    title: "Make Things Happen",
    tags: ["Branding"],
    client: "Nova Collective",
    year: "2025",
    services: ["Brand Identity", "Guidelines"],
    summary: "A full identity overhaul for a growing exhibitions collective.",
    description:
      "Nova Collective needed an identity that could flex across exhibitions, digital, and print without losing its edge. We rebuilt their mark, palette, and type system from scratch, then documented it in guidelines their team still uses today.",
    color: "#111111",
  },
  {
    slug: "life-in-every-stitch",
    image: "/images/portfolio/life-in-every-stitch.jpg",
    gallery: ["/images/portfolio/life-in-every-stitch-2.jpg", "/images/portfolio/life-in-every-stitch-3.jpg"],
    title: "Life In Every Stitch",
    tags: ["Web Design", "Branding"],
    client: "Fathom Studio",
    year: "2025",
    services: ["Web Design", "Front-end Development"],
    summary: "An e-commerce experience built around texture and craft.",
    description:
      "Fathom Studio makes hand-finished textiles and needed a site that felt as tactile as the product. We designed a slow-scroll, image-led experience and built it on Next.js for speed without sacrificing detail.",
    color: "#1c1c1c",
  },
  {
    slug: "our-passion",
    image: "/images/portfolio/our-passion.jpg",
    gallery: ["/images/portfolio/our-passion-2.jpg", "/images/portfolio/our-passion-3.jpg"],
    title: "Our Passion",
    tags: ["Advertising"],
    client: "Arclight Coffee",
    year: "2024",
    services: ["Campaign Strategy", "Art Direction"],
    summary: "A city-wide out-of-home campaign for an independent roaster.",
    description:
      "Arclight wanted to go toe-to-toe with national chains on a local budget. We built a single bold visual idea that worked across posters, transit ads, and social — punching well above its media spend.",
    color: "#262626",
  },
  {
    slug: "your-vision",
    image: "/images/portfolio/your-vision.jpg",
    gallery: ["/images/portfolio/your-vision-2.jpg", "/images/portfolio/your-vision-3.jpg"],
    title: "Your Vision",
    tags: ["Branding"],
    client: "Kindred Health",
    year: "2024",
    services: ["Brand Strategy", "Naming", "Identity"],
    summary: "Naming and identity for a new telehealth platform.",
    description:
      "Kindred came to us pre-launch with just an idea. We landed the name, built the identity, and shaped the tone of voice that now runs across their product and marketing.",
    color: "#101010",
  },
  {
    slug: "beauty-you-can-afford",
    image: "/images/portfolio/beauty-you-can-afford.jpg",
    gallery: ["/images/portfolio/beauty-you-can-afford-2.jpg", "/images/portfolio/beauty-you-can-afford-3.jpg"],
    title: "Beauty You Can Afford",
    tags: ["Advertising"],
    client: "Lumen Skincare",
    year: "2024",
    services: ["Performance Creative", "Copywriting"],
    summary: "Performance-driven creative for a direct-to-consumer skincare brand.",
    description:
      "We produced a library of performance ad creative and lines for Lumen, testing fast and iterating on what converted, without losing the premium feel of the brand.",
    color: "#181818",
  },
  {
    slug: "rely-on-experience",
    image: "/images/portfolio/rely-on-experience.jpg",
    gallery: ["/images/portfolio/rely-on-experience-2.jpg", "/images/portfolio/rely-on-experience-3.jpg"],
    title: "Rely On Experience",
    tags: ["Motion", "Branding"],
    client: "Fieldstone Capital",
    year: "2023",
    services: ["Brand Film", "Motion Graphics"],
    summary: "A brand film and motion system for an investment firm.",
    description:
      "Fieldstone needed to explain a complex offering simply. We wrote, shot, and animated a brand film paired with a modular motion system for use across investor decks and social.",
    color: "#0d0d0d",
  },
  {
    slug: "start-with-trust",
    image: "/images/portfolio/start-with-trust.jpg",
    gallery: ["/images/portfolio/start-with-trust-2.jpg", "/images/portfolio/start-with-trust-3.jpg"],
    title: "Start With Trust",
    tags: ["Web Design"],
    client: "Harbor Legal",
    year: "2023",
    services: ["Web Design", "Design System"],
    summary: "A design system and site rebuild for a growing law firm.",
    description:
      "Harbor Legal's site hadn't changed in a decade. We rebuilt it on a component-based design system so their team could add new practice pages without calling a developer.",
    color: "#141414",
  },
  {
    slug: "imagine-the-impossible",
    image: "/images/portfolio/imagine-the-impossible.jpg",
    gallery: ["/images/portfolio/imagine-the-impossible-2.jpg", "/images/portfolio/imagine-the-impossible-3.jpg"],
    title: "Imagine The Impossible",
    tags: ["Print"],
    client: "Northline Publishing",
    year: "2023",
    services: ["Art Direction", "Print Design"],
    summary: "Editorial art direction for a quarterly print publication.",
    description:
      "We art-directed three issues of Northline's flagship quarterly, building a flexible grid system and cover concept that let each issue feel distinct while staying on-brand.",
    color: "#202020",
  },
  {
    slug: "natural-beauty",
    image: "/images/portfolio/natural-beauty.jpg",
    gallery: ["/images/portfolio/natural-beauty-2.jpg", "/images/portfolio/natural-beauty-3.jpg"],
    title: "Natural Beauty",
    tags: ["Branding", "Print"],
    client: "Wren & Co.",
    year: "2022",
    services: ["Brand Identity", "Packaging"],
    summary: "Packaging and identity for a plant-based home goods brand.",
    description:
      "Wren & Co. wanted packaging that felt premium without the usual minimalist clichés. We built a warmer, more textured identity system that now spans over 40 SKUs.",
    color: "#161616",
  },
];
