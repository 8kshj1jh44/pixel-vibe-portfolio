import { skills } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function SkillsDialog({ collected, onClose }: { collected: string[]; onClose: () => void }) {
  return (
    <PixelDialog title="SKILL INVENTORY" onClose={onClose}>
      <ul className="grid gap-2 sm:grid-cols-2">
        {skills.map((s) => (
          <li key={s} className="border-4 border-border bg-secondary px-3 py-2">
            <span className="text-accent">★</span> {s}
            {collected.includes(s) && (
              <span className="ml-2 font-display text-[0.45rem] text-lime-crt">GOT IT</span>
            )}
          </li>
        ))}
      </ul>
    </PixelDialog>
  );
}
