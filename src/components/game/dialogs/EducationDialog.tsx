import { education } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function EducationDialog({ onClose }: { onClose: () => void }) {
  return (
    <PixelDialog title="DEEP ARCHIVE — EDUCATION" onClose={onClose}>
      <h3 className="font-display text-[0.6rem] text-accent">{education.degree}</h3>
      <p className="mt-2 text-cyan-crt">{education.school}</p>
      <p className="mt-2 text-muted-foreground">{education.period}</p>
    </PixelDialog>
  );
}
