import type { Community } from "@/types/community";

export const COMMUNITIES: Community[] = [
  {
    slug: "artificial-intelligence",
    number: "01",
    name: "Artificial Intelligence",
    description: "Models, ML pipelines, applied research.",
    iconPaths: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
  },
  {
    slug: "cloud-computing",
    number: "02",
    name: "Cloud Computing",
    description: "Infra, DevOps, distributed systems.",
    iconPaths: '<path d="M18 10h-1.26A8 8 0 108 20h10a4 4 0 000-8z"/>',
  },
  {
    slug: "cybersecurity",
    number: "03",
    name: "Cybersecurity",
    description: "Offensive security, CTFs, defense.",
    iconPaths: '<path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z"/>',
  },
  {
    slug: "software-engineering",
    number: "04",
    name: "Software Engineering",
    description: "Product, architecture, craft.",
    iconPaths: '<path d="M8 4L2 12l6 8M16 4l6 8-6 8"/>',
  },
  {
    slug: "robotics",
    number: "05",
    name: "Robotics",
    description: "Embedded systems, hardware, control.",
    iconPaths: '<rect x="6" y="8" width="12" height="10" rx="2"/><path d="M9 4h6v4H9zM6 13H3M21 13h-3"/>',
  },
  {
    slug: "ui-ux",
    number: "06",
    name: "UI / UX",
    description: "Systems, motion, product design.",
    iconPaths: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M8 12h5"/>',
  },
  {
    slug: "data-science",
    number: "07",
    name: "Data Science",
    description: "Analytics, statistics, visualization.",
    iconPaths: '<path d="M4 20V10M12 20V4M20 20v-7"/>',
  },
  {
    slug: "mobile-development",
    number: "08",
    name: "Mobile Development",
    description: "iOS, Android, cross-platform.",
    iconPaths: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  },
];
