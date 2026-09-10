export const SITE_CONFIG = {
  name: "Chiromo Tech Club",
  shortName: "CTC",
  tagline: "Building Africa's Next Generation of Innovators.",
  description:
    "Chiromo Tech Club (CTC) is a student-led technology community at the University of Nairobi Chiromo Campus — AI, software engineering, cloud, cybersecurity, robotics, data science, and design.",
  url: "https://chiromo-tech-club.vercel.app",
  locale: "en_KE",
  /** Club contact / reply-to for EmailJS (not a personal login). */
  contactEmail: "ctc.uonbi@gmail.com",
  /**
   * Default Google Calendar when no joint sources are saved in Admin → Calendars.
   * Override with NEXT_PUBLIC_GOOGLE_CALENDAR_SRC (comma-separated for multiple).
   */
  googleCalendarSrc: "ctc.uonbi@gmail.com",
  /** Membership fee payment (M-Pesa Pochi la Biashara). */
  payment: {
    method: "Pochi la Biashara",
    tillOrPhone: "0143184616",
    fullFeeKes: 500,
    depositKes: 250,
  },
  keywords: [
    "Chiromo Tech Club",
    "CTC",
    "Chiromo",
    "tech club",
    "University of Nairobi",
    "UoN",
    "UoN Chiromo",
    "Chiromo Campus",
    "student tech club Kenya",
    "Nairobi tech community",
    "AI club Kenya",
    "software engineering club",
    "cybersecurity club UoN",
    "robotics Chiromo",
    "data science club Nairobi",
    "join Chiromo Tech Club",
  ],
  socials: {
    github: "https://github.com/chiromo-tech-club",
    instagram: "https://instagram.com/chiromotechclub",
    linkedin: "https://linkedin.com/company/chiromo-tech-club",
  },
} as const;
