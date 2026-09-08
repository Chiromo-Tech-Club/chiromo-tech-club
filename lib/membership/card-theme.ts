import type { Role } from "@/types/roles";
import { EXEC_TITLE_LABELS, isExecTitle } from "@/types/exec-title";

export const CARD_THEME_IDS = [
  "navy_gold",
  "white_navy",
  "midnight_cyan",
  "forest_lime",
  "burgundy_rose",
  "slate_silver",
  "royal_violet",
] as const;

export type CardThemeId = (typeof CARD_THEME_IDS)[number];

export interface CardTheme {
  id: CardThemeId;
  label: string;
  /** Card face background */
  bg: string;
  /** Primary text / borders / QR (gold in reference) */
  accent: string;
  /** Circuit traces */
  circuit: string;
  /** Soft mesh highlight on the right */
  meshFrom: string;
  meshTo: string;
  /** Light face (white / cream) — needs dark text & a hairline border */
  isLight?: boolean;
}

export const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  navy_gold: {
    id: "navy_gold",
    label: "Navy & Gold",
    bg: "#0B1B3A",
    accent: "#D4AF37",
    circuit: "#7DD3FC",
    meshFrom: "#22d3ee",
    meshTo: "#f59e0b",
  },
  white_navy: {
    id: "white_navy",
    label: "White & Navy",
    bg: "#FFFFFF",
    accent: "#0B1B3A",
    circuit: "#94A3B8",
    meshFrom: "#38BDF8",
    meshTo: "#D4AF37",
    isLight: true,
  },
  midnight_cyan: {
    id: "midnight_cyan",
    label: "Midnight Cyan",
    bg: "#071525",
    accent: "#38BDF8",
    circuit: "#67E8F9",
    meshFrom: "#22d3ee",
    meshTo: "#a78bfa",
  },
  forest_lime: {
    id: "forest_lime",
    label: "Forest Lime",
    bg: "#0B1F17",
    accent: "#A3E635",
    circuit: "#86EFAC",
    meshFrom: "#4ade80",
    meshTo: "#facc15",
  },
  burgundy_rose: {
    id: "burgundy_rose",
    label: "Burgundy Rose",
    bg: "#1A0B14",
    accent: "#FB7185",
    circuit: "#FDA4AF",
    meshFrom: "#f472b6",
    meshTo: "#fb923c",
  },
  slate_silver: {
    id: "slate_silver",
    label: "Slate Silver",
    bg: "#111827",
    accent: "#E5E7EB",
    circuit: "#93C5FD",
    meshFrom: "#94a3b8",
    meshTo: "#60a5fa",
  },
  royal_violet: {
    id: "royal_violet",
    label: "Royal Violet",
    bg: "#140B24",
    accent: "#C4B5FD",
    circuit: "#A78BFA",
    meshFrom: "#a78bfa",
    meshTo: "#f472b6",
  },
};

export function isCardThemeId(value: unknown): value is CardThemeId {
  return typeof value === "string" && (CARD_THEME_IDS as readonly string[]).includes(value);
}

export function resolveCardTheme(value?: string | null): CardTheme {
  if (isCardThemeId(value)) return CARD_THEMES[value];
  return CARD_THEMES.navy_gold;
}

/** Large role line on the card — prefers the named executive seat when set. */
export function getCardRoleTitle(role?: string | null, execTitle?: string | null): string {
  // Named leadership seat always wins (Vice Chairperson, Treasurer, …)
  if (execTitle && isExecTitle(execTitle)) {
    if (execTitle === "patron") return "PATRON";
    if (execTitle === "corporate_affairs") return "CORPORATE AFFAIRS";
    if (execTitle === "training_coordinator") return "TRAINING COORDINATOR";
    if (execTitle === "membership_officer") return "MEMBERSHIP OFFICER";
    if (execTitle === "secretary_general") return "SECRETARY GENERAL";
    if (execTitle === "vice_chairperson") return "VICE CHAIRPERSON";
    return EXEC_TITLE_LABELS[execTitle].toUpperCase();
  }

  if (role === "admin") return "ADMINISTRATOR";
  if (role === "exec") return "EXECUTIVE";
  if (role === "member") return "MEMBER";
  return "VISITOR";
}

export function getCardAccessLevel(
  role?: string | null,
  membershipStatus?: string | null,
  execTitle?: string | null,
): string {
  if (role === "admin") return "UNLIMITED";
  if (role === "exec" || isExecTitle(execTitle)) return "LEADERSHIP";
  if (role === "member" || membershipStatus === "approved") return "STANDARD";
  if (membershipStatus === "rejected") return "REVOKED";
  return "LIMITED";
}

export function getCardExpiryLabel(opts: {
  role?: string | null;
  execTitle?: string | null;
  expiryShort: string;
}): string {
  // Leadership / admin cards: perpetual access
  if (opts.role === "admin" || opts.role === "exec" || isExecTitle(opts.execTitle)) {
    return "PERPETUAL";
  }
  return opts.expiryShort;
}

export function roleNeedsSeat(role: Role | string | null | undefined): boolean {
  return role === "exec";
}
