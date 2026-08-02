import { ROUTES } from "@/constants/routes";

export interface NavItem {
  label: string;
  href: string;
}

/** Single source of truth for nav links, reused by Navbar, MobileMenu, and CommandPalette. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Who We Are", href: ROUTES.whoWeAre },
  { label: "Communities", href: ROUTES.communities },
  { label: "Projects", href: ROUTES.projects },
  { label: "Events", href: ROUTES.events },
  { label: "Leadership", href: ROUTES.leadership },
];
