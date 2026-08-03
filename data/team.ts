export interface TeamMember {
  slug: string;
  name: string;
  nickname: string;
  role: string;
  image: string;
  funFact: string;
}

/**
 * Real leadership cards (cropped from the club's own designed profile cards).
 * Order roughly follows the org chart so the featured/highlighted card in the
 * carousel lands on the Chairperson.
 */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: "kaleb-wambua",
    name: "Kaleb Wambua",
    nickname: "Mr. President",
    role: "Membership & Engagement Officer",
    image: "/images/team-cards/kaleb-wambua-membership-engagement.jpg",
    funFact: "Beyond being a chemist and a tech pioneer, I can rap and compose poems.",
  },
  {
    slug: "geoffrey-obwocha",
    name: "Geoffrey Obwocha",
    nickname: "OB",
    role: "Chairperson",
    image: "/images/team-cards/geoffrey-obwocha-chairperson.jpg",
    funFact: "My curiosity has the range of a Swiss Army Knife.",
  },
  {
    slug: "chrisben-leo-evans",
    name: "Chrisben Leo Evans",
    nickname: "CB",
    role: "Vice Chairperson",
    image: "/images/team-cards/chrisben-leo-evans-vice-chairperson.jpg",
    funFact: "Collects hackathons like Pokémon, catches bugs even faster than prizes.",
  },
  {
    slug: "bradley-ikileng",
    name: "Bradley Ikileng",
    nickname: "Kaizen",
    role: "Secretary General",
    image: "/images/team-cards/bradley-ikileng-secretary-general.jpg",
    funFact: "My screentime spikes significantly whenever there's a Grand Prix or an invisible bug hiding somewhere in my code.",
  },
  {
    slug: "breattah-okeyo",
    name: "Breattah Okeyo",
    nickname: "Mama Pesa",
    role: "Treasurer",
    image: "/images/team-cards/breattah-okeyo-treasurer.jpg",
    funFact: "Numbers and I have a better relationship than I do with humans.",
  },
  {
    slug: "david-mwangi",
    name: "David Mwangi",
    nickname: "Davypac",
    role: "Advisor & Club Consultant",
    image: "/images/team-cards/david-mwangi-advisor-consultant.jpg",
    funFact: "I am a statistics student, but somehow I still make very confident decisions without calculating the probability first.",
  },
  {
    slug: "ivan-dancun",
    name: "Ivan Dancun",
    nickname: "Panther",
    role: "Training & Skills Dev Coordinator",
    image: "/images/team-cards/ivan-dancun-training-skills-coordinator.jpg",
    funFact: "Silence is my comfort zone, not my weakness.",
  },
  {
    slug: "sabaya-lakiesha",
    name: "Sabaya Lakiesha",
    nickname: "Saboh",
    role: "Corporate Affairs & Publicity Officer",
    image: "/images/team-cards/sabaya-lakiesha-corporate-affairs.jpg",
    funFact: "My headphones are almost always on — deep into a research rabbit hole with a highly specific playlist.",
  },
];
