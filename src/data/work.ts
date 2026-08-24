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
// Each tile spans to match its cover's shape, so nothing is cropped by the grid.
export const featuredWork: WorkItem[] = [
  {
    slug: "otonomus-hotel",
    title: "Otonomus Hotel",
    tags: ["Web Design","Branding"],
    image: "/images/work/otonomus-hotel.webp",
    width: 1200,
    height: 1200,
    span: "col-span-2 row-span-2",
    href: "/portfolio",
  },
  {
    slug: "tigre-milano",
    title: "Tigre Milano",
    tags: ["Branding","Web Design"],
    image: "/images/work/tigre-milano.webp",
    width: 1000,
    height: 2000,
    span: "row-span-2",
    href: "/portfolio",
  },
  {
    slug: "cherry-m",
    title: "Cherry M",
    tags: ["Branding","Print"],
    image: "/images/work/cherry-m.webp",
    width: 1000,
    height: 2000,
    span: "row-span-2",
    href: "/portfolio",
  },
  {
    slug: "livv-homes",
    title: "LIVV Homes",
    tags: ["Web Design","Advertising"],
    image: "/images/work/livv-homes.webp",
    width: 1600,
    height: 800,
    span: "col-span-2",
    href: "/portfolio",
  },
  {
    slug: "growth-luxury-homes",
    title: "Growth Luxury Homes",
    tags: ["Advertising","Print"],
    image: "/images/work/growth-luxury-homes.webp",
    width: 1600,
    height: 800,
    span: "col-span-2",
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
    slug: "lentouraj",
    title: "L'Entouraj",
    tags: ["Branding"],
    image: "/images/work/lentouraj.webp",
    width: 1200,
    height: 1200,
    span: "",
    href: "/portfolio",
  },
];
