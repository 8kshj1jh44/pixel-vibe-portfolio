import { GROUND_Y, type BossKind, type Coin, type Obstacle, type Station } from "./engine";
import { skills } from "@/content/portfolio";

/** Surface-to-underwater dive cutscene phases driven by the game loop. */
export type TransitionPhase = "none" | "collapse" | "falling" | "splash" | "blackout" | "card";

export type Screen = "title" | "rules" | "customize" | "playing";

export const STATIONS: Station[] = [
  { id: "about", kind: "sign", x: 240, label: "ABOUT ME" },
  { id: "skills", kind: "sign", x: 960, label: "SKILLS" },
  { id: "jobs", kind: "sign", x: 2420, label: "JOBS" },
  { id: "websites", kind: "cabinet", x: 3840, label: "WEBSITES" },
  { id: "education", kind: "sign", x: 5580, label: "EDUCATION" },
  { id: "certifications", kind: "sign", x: 5900, label: "CERTS" },
  { id: "golem", kind: "boss", x: 4540, label: "SIGNAL GOLEM" },
  { id: "goblin", kind: "boss", x: 4860, label: "BIG BAD GOBLIN" },
  { id: "angler", kind: "boss", x: 6080, label: "ANGLERFISH" },
  { id: "fish", kind: "boss", x: 6400, label: "BIG FISH" },
  { id: "tools", kind: "sign", x: 6860, label: "TOOLS" },
  { id: "kraken", kind: "boss", x: 7240, label: "KRAKEN" },
  { id: "end", kind: "flag", x: 7800, label: "GOAL" },
];

export const OBSTACLES: Obstacle[] = [
  { id: "crate-1", x: 620, width: 28, height: 28, kind: "crate" },
  { id: "spikes-1", x: 1510, width: 42, height: 8, kind: "spikes" },
  { id: "crate-2", x: 2860, width: 34, height: 34, kind: "crate" },
  { id: "spikes-2", x: 4380, width: 50, height: 8, kind: "spikes" },
  { id: "mine-1", x: 5700, width: 28, height: 24, kind: "mine" },
  { id: "coral-1", x: 6120, width: 42, height: 26, kind: "coral" },
  { id: "mine-2", x: 6750, width: 30, height: 26, kind: "mine" },
  { id: "coral-2", x: 7080, width: 46, height: 30, kind: "coral" },
  { id: "crate-3", x: 1180, width: 30, height: 30, kind: "crate" },
  { id: "crate-4", x: 1230, width: 30, height: 58, kind: "crate" },
  { id: "crate-5", x: 3320, width: 32, height: 44, kind: "crate" },
];

/** Crates and coral are solid platforms you can stand on. */
export const SOLIDS = OBSTACLES.filter((o) => o.kind === "crate" || o.kind === "coral");

export const BOSS_IDS: BossKind[] = ["fish", "kraken", "golem", "angler", "goblin"];

export const BOSS_TITLES: Record<BossKind, string> = {
  fish: "BIG FISH",
  kraken: "KRAKEN",
  golem: "SIGNAL GOLEM",
  angler: "ANGLERFISH",
  goblin: "BIG BAD GOBLIN",
};

export const BOSS_POSITIONS: Record<BossKind, number> = {
  fish: 6400,
  kraken: 7240,
  golem: 4540,
  angler: 6080,
  goblin: 4860,
};

export const INITIAL_COINS: Coin[] = skills.map((label, i) => ({
  id: `skill-${i}`,
  x: 1120 + i * 130,
  y: GROUND_Y - (i % 2 === 0 ? 60 : 96),
  taken: false,
  label,
}));
