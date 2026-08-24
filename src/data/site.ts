export const site = {
  name: "VIPMINDS",
  tagline: "A creative agency for brands that refuse to blend in.",
  description:
    "VIPMINDS is a creative agency specializing in brand identity, web design, and advertising for companies who want to stand out.",
  email: "marketing@vipminds.com",
  phone: "+1 702 334-0277",
  // `line` is optional — Beverly Hills has no street address supplied yet.
  addresses: [
    {
      label: "Las Vegas",
      line: "8890 Spanish Ridge Ave, Las Vegas, NV 89148, United States" as string | undefined,
      phone: "+1 702 334-0277",
    },
    {
      label: "Beverly Hills",
      line: undefined as string | undefined,
      phone: "+1 702 334-0277",
    },
    {
      label: "Beirut",
      line: "Jal El Dib, Beirut, Lebanon" as string | undefined,
      phone: "+961 3 373882",
    },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Twitter", href: "https://twitter.com" },
    { label: "Behance", href: "https://behance.net" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
};

export const nav = [
  { label: "Home", href: "/#home", id: "home" },
  { label: "Services", href: "/#services", id: "services" },
  { label: "Portfolio", href: "/#portfolio", id: "portfolio" },
  { label: "Contact", href: "/#contact", id: "contact" },
];
