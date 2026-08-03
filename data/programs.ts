export interface HeroProgram {
  slug: string;
  title: string;
  description: string;
  highlighted?: boolean;
}

export const HERO_PROGRAMS: HeroProgram[] = [
  {
    slug: "artificial-intelligence",
    title: "AI & Research Lab",
    description: "Train models, run reading groups, and ship applied research alongside a mentor.",
  },
  {
    slug: "cloud-computing",
    title: "Cloud & Infrastructure Program",
    description: "Hands-on infra, DevOps, and distributed-systems track for every club project.",
    highlighted: true,
  },
  {
    slug: "software-engineering",
    title: "Access to Mentorship",
    description: "Get paired with a senior member to plan your path from first commit to shipped product.",
  },
  {
    slug: "robotics",
    title: "Hardware & Robotics Workshop",
    description: "Build embedded systems and control software, from breadboard to working prototype.",
  },
];
