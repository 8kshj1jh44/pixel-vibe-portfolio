import { projects, type Project } from "@/content/portfolio";
import { PixelDialog } from "../PixelDialog";

export function ProjectDialog({ index, onClose }: { index: number; onClose: () => void }) {
  const project = projects[index]!;
  return (
    <PixelDialog
      title={`SNEAK PEEK — ${project.label}`}
      onClose={onClose}
      footer={
        project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer noopener"
            className="pixel-btn bg-primary text-primary-foreground"
          >
            VISIT SITE
          </a>
        ) : (
          <span className="font-display text-[0.5rem] text-accent">COMING SOON</span>
        )
      }
    >
      <ProjectPeek project={project} />
    </PixelDialog>
  );
}

function ProjectPeek({ project }: { project: Project }) {
  return (
    <div>
      <div className="pixel-box-light bg-screen p-2">
        <img
          src={project.image}
          alt={`${project.name} preview`}
          width={640}
          height={512}
          loading="lazy"
          className="h-44 w-full object-cover sm:h-56"
        />
      </div>
      <h3 className="mt-4 font-display text-[0.6rem] text-accent">{project.name}</h3>
      <p className="mt-2">{project.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <li key={t} className="border-4 border-border bg-secondary px-2 py-1 text-base">
            {t}
          </li>
        ))}
      </ul>
      {project.placeholder && (
        <p className="mt-3 text-muted-foreground">
          ▪ Placeholder slot — real project details drop in here soon.
        </p>
      )}
    </div>
  );
}
