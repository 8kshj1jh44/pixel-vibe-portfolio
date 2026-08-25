import type { BossKind, Station } from "@/components/game/engine";
import { BOSS_IDS } from "@/components/game/level";
import type { Dialog } from "./types";

/** Map an in-world station to the dialog it should open. */
export function openStationDialog(station: Station, completedBosses: BossKind[]): Dialog {
  if (station.id === "about") return { type: "about" };
  if (station.id === "skills") return { type: "skills" };
  if (station.id === "contact") return { type: "contact" };
  if (station.id === "end") return { type: "end" };
  if (station.id === "education") return { type: "education" };
  if (station.id === "certifications") return { type: "certifications" };
  if (station.id === "tools") return { type: "tools" };
  if (station.id === "jobs") return { type: "jobs" };
  if (station.id === "websites") return { type: "projects" };
  if (BOSS_IDS.includes(station.id as BossKind)) {
    const boss = station.id as BossKind;
    if (completedBosses.includes(boss)) return { type: "challenge", boss, step: "success" };
    return { type: "challenge", boss, step: "intro" };
  }
  return null;
}
