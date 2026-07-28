export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
  image: string;
};

export const posts: Post[] = [
  {
    slug: "discover-digital-world",
    image: "/images/blog/discover-digital-world.jpg",
    title: "Discover Digital World",
    category: "Design",
    date: "2026-06-12",
    author: "Austin Rogers",
    excerpt: "Why the best digital brands treat design as a system, not a one-off project.",
    content: [
      "The brands that hold up over time rarely got there with a single great design. They got there by building a system — a set of rules for color, type, tone, and layout that everyone on the team can apply consistently, long after the original designers have moved on.",
      "That's the shift we push every client toward: fewer one-off decisions, more documented systems. It's less glamorous than a single hero shot, but it's the difference between a brand that scales and one that needs a redesign every eighteen months.",
      "In practice, that means shipping a working component library alongside the visual identity, not a static PDF of guidelines nobody opens again.",
    ],
  },
  {
    slug: "move-your-body",
    image: "/images/blog/move-your-body.jpg",
    title: "Move Your Body: Motion As A Brand Asset",
    category: "Motion",
    date: "2026-05-28",
    author: "Walter Perry",
    excerpt: "Motion design isn't decoration — treated right, it's part of your brand system.",
    content: [
      "Most brand guidelines stop at logo usage and a color palette. The ones that hold up on screen also define how things move: easing curves, transition timing, and which elements get animated at all.",
      "We treat motion as a fourth pillar alongside color, type, and imagery. Define it once, and every product interaction and marketing video inherits the same feel automatically.",
    ],
  },
  {
    slug: "find-your-true-passion",
    image: "/images/blog/find-your-true-passion.jpg",
    title: "Find Your True Passion In Brand Strategy",
    category: "Strategy",
    date: "2026-05-10",
    author: "Jane Willis",
    excerpt: "Positioning work is the least visible part of branding and the most important.",
    content: [
      "Clients almost always come to us asking for a new logo. What they actually need, more often than not, is clarity on who they're for and why anyone should care.",
      "We spend the first two weeks of every branding engagement on positioning before a single visual gets made. It's slower up front, but it means the design work that follows actually has something to say.",
    ],
  },
  {
    slug: "feel-the-freedom",
    image: "/images/blog/feel-the-freedom.jpg",
    title: "Feel The Freedom Of A Real Design System",
    category: "Product",
    date: "2026-04-22",
    author: "Mia Chen",
    excerpt: "What changes internally once a team finally has a real design system in place.",
    content: [
      "\"We shipped a feature in an afternoon that used to take a week.\" That's the sentence we hear most often from teams six months after a design system rollout.",
      "The freedom isn't just speed — it's confidence. Designers and engineers stop re-litigating spacing and color choices on every ticket, and start focusing on the actual problem.",
    ],
  },
  {
    slug: "leading-effective-campaigns",
    image: "/images/blog/leading-effective-campaigns.jpg",
    title: "Leading Effective Advertising Campaigns",
    category: "Advertising",
    date: "2026-04-02",
    author: "Ethan Black",
    excerpt: "The single-idea rule that keeps campaigns from falling apart across channels.",
    content: [
      "Every format has its own constraints — a six-second pre-roll ad and a highway billboard have almost nothing in common mechanically. What holds a campaign together across both is a single idea simple enough to survive translation.",
      "If you can't explain the core idea in one sentence, it's not ready to go to fifteen channels yet.",
    ],
  },
  {
    slug: "the-speed-of-thought",
    image: "/images/blog/the-speed-of-thought.jpg",
    title: "The Speed Of Thought: Writing Copy That Converts",
    category: "Copywriting",
    date: "2026-03-15",
    author: "Austin Rogers",
    excerpt: "Fast, clear copy consistently outperforms clever copy. Here's why.",
    content: [
      "Clever headlines win awards. Clear headlines win customers. When we test copy for clients, the plain, specific version beats the clever one more often than either of us expects going in.",
      "That doesn't mean voice doesn't matter — it means voice should show up in word choice and rhythm, not in making the reader work to understand the offer.",
    ],
  },
];
