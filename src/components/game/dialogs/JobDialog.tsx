import { jobs } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function JobDialog({ index, onClose }: { index: number; onClose: () => void }) {
  const job = jobs[index]!;
  return (
    <PixelDialog title={`WORK HISTORY 0${index + 1}`} onClose={onClose}>
      <h3 className="font-display text-[0.6rem] text-accent">{job.role}</h3>
      {job.company && <p className="text-cyan-crt">{job.company}</p>}
      <p className="text-muted-foreground">{job.period}</p>
      <ul className="mt-3 space-y-1">
        {job.bullets.map((b) => (
          <li key={b}>▪ {b}</li>
        ))}
      </ul>
    </PixelDialog>
  );
}
