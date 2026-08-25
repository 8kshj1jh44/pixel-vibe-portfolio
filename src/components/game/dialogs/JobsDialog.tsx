import { jobs } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function JobsDialog({
  onPickJob,
  onClose,
}: {
  onPickJob: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <PixelDialog title="WORK HISTORY" onClose={onClose}>
      <div className="grid gap-2">
        {jobs.map((job, index) => (
          <button
            type="button"
            key={`${job.role}-${index}`}
            onClick={() => onPickJob(index)}
            className="border-4 border-border bg-secondary p-2 text-left active:translate-y-1"
          >
            <span className="block font-display text-accent">{job.role}</span>
            {job.company && <span className="block text-cyan-crt">{job.company}</span>}
            <span className="block text-muted-foreground">{job.period}</span>
          </button>
        ))}
      </div>
    </PixelDialog>
  );
}
