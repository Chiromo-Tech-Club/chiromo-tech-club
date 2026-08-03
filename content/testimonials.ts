export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Chiromo Tech Club is where I shipped my first real product — and where I learned to lead a team.",
    author: "Wanjiru K.",
    role: "Software Engineering Lead",
  },
  {
    quote: "The research community pushed me to publish before I even graduated.",
    author: "Otieno M.",
    role: "AI & Research",
  },
  {
    quote: "I walked in knowing nothing about design systems. I left running the UI/UX studio.",
    author: "Amina S.",
    role: "Design Lead",
  },
];