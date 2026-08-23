import { projects } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function ProjectsDialog({
  onPickProject,
  onClose,
}: {
  onPickProject: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <PixelDialog title="DELIVERED WEBSITES" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-3">
        {projects.map((project, index) => (
          <button
            type="button"
            key={project.label}
            onClick={() => onPickProject(index)}
            className="border-4 border-border bg-secondary p-2 text-left active:translate-y-1"
          >
            <img
              src={project.image}
              alt={`${project.name} preview`}
              className="h-24 w-full object-cover"
            />
            <span className="mt-2 block font-display text-[0.45rem] text-accent">
              {project.name}
            </span>
          </button>
        ))}
      </div>
    </PixelDialog>
  );
}
