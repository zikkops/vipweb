export type WorkItem = {
  slug: string;
  title: string;
  tags: string[];
  image: string;
  width: number;
  height: number;
  /** grid span, chosen to match the cover's own aspect ratio */
  span: string;
  href: string;
};

// Featured client work shown in the home-page mosaic.
// All covers are square: one 2x2 hero plus eight 1x1s fills a 4x3 grid,
// so "And Much More" lands in the bottom-right corner.
export const featuredWork: WorkItem[] = [
  {
    slug: "otonomus-hotel",
    title: "Otonomus Hotel",
    tags: ["Web Design","Branding"],
    image: "/images/work/otonomus-hotel.webp",
    width: 1600,
    height: 1600,
    span: "col-span-2 row-span-2",
    href: "/portfolio",
  },
  {
    slug: "88-chocolate-creations",
    title: "88 Chocolate Creations",
    tags: ["Web Design","Branding"],
    image: "/images/work/88-chocolate-creations.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "nayla",
    title: "Nayla",
    tags: ["Branding","Print"],
    image: "/images/work/nayla.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "livv-homes",
    title: "LIVV Homes",
    tags: ["Web Design","Advertising"],
    image: "/images/work/livv-homes.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "growth-luxury-homes",
    title: "Growth Luxury Homes",
    tags: ["Advertising","Print"],
    image: "/images/work/growth-luxury-homes.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "growth-holdings",
    title: "Growth Holdings",
    tags: ["Branding","Print"],
    image: "/images/work/growth-holdings.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "adel-real-estate",
    title: "Adel Real Estate",
    tags: ["Branding","Print"],
    image: "/images/work/adel-real-estate.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "cherry-m",
    title: "Cherry M",
    tags: ["Branding","Print"],
    image: "/images/work/cherry-m.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
  {
    slug: "and-much-more",
    title: "And Much More",
    tags: ["Selected Work"],
    image: "/images/work/and-much-more.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
];
