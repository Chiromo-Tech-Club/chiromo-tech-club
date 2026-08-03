import { ROUTES } from "@/constants/routes";

export interface CommandItem {
  id: string;
  label: string;
  href: string;
}

export const COMMAND_ITEMS: CommandItem[] = [
  { id: "home", label: "Hero", href: ROUTES.home },
  { id: "who", label: "Who We Are", href: ROUTES.whoWeAre },
  { id: "communities", label: "Communities", href: ROUTES.communities },
  { id: "projects", label: "Projects", href: ROUTES.projects },
  { id: "events", label: "Events", href: ROUTES.events },
  { id: "leadership", label: "Leadership", href: ROUTES.leadership },
  { id: "join", label: "Join the Club", href: ROUTES.join },
];