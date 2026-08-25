import type { BossKind } from "@/components/game/engine";

export type Dialog =
  | { type: "about" }
  | { type: "skills" }
  | { type: "job"; index: number }
  | { type: "jobs" }
  | { type: "project"; index: number }
  | { type: "projects" }
  | { type: "education" }
  | { type: "certifications" }
  | { type: "tools" }
  | { type: "challenge"; boss: BossKind; step: "intro" | "active" | "success" }
  | { type: "contact" }
  | { type: "end" }
  | null;
