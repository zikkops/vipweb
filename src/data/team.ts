export type Social = { platform: "instagram" | "x" | "linkedin"; href: string };

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: Social[];
};

const defaultSocials: Social[] = [
  { platform: "instagram", href: "#" },
  { platform: "x", href: "#" },
  { platform: "linkedin", href: "#" },
];

export const team: TeamMember[] = [
    { slug: "jane-willis", image: "/images/team/jane-willis.jpg", name: "Jane Willis", role: "Marketing Director", bio: "Leads brand strategy and client partnerships across the agency.", socials: defaultSocials },
    { slug: "ralph-fields", image: "/images/team/ralph-fields.jpg", name: "Ralph Fields", role: "Lead Designer", bio: "Shapes the visual language behind every identity we ship.", socials: defaultSocials },
    { slug: "lori-harvey", image: "/images/team/lori-harvey.jpg", name: "Lori Harvey", role: "Project Manager", bio: "Keeps every engagement on time, on budget, and on brief.", socials: defaultSocials },
    { slug: "walter-perry", image: "/images/team/walter-perry.jpg", name: "Walter Perry", role: "Motion Designer", bio: "Brings brand systems to life across video and motion.", socials: defaultSocials },
    { slug: "austin-rogers", image: "/images/team/austin-rogers.jpg", name: "Austin Rogers", role: "Content Strategist", bio: "Writes and structures the words behind every campaign.", socials: defaultSocials },
    { slug: "mia-chen", image: "/images/team/mia-chen.jpg", name: "Mia Chen", role: "Product Designer", bio: "Designs the interfaces for our web and product engagements.", socials: defaultSocials },
    { slug: "devon-marsh", image: "/images/team/devon-marsh.jpg", name: "Devon Marsh", role: "Front-end Engineer", bio: "Builds the sites and products our design team dreams up.", socials: defaultSocials },
    { slug: "priya-nair", image: "/images/team/priya-nair.jpg", name: "Priya Nair", role: "Growth Lead", bio: "Runs performance and lifecycle marketing for our clients.", socials: defaultSocials },
];
