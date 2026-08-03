import { createFileRoute, Link } from "@tanstack/react-router";
import { GameStage } from "@/components/game/GameStage";

const title = "Franz Lyster Tagalogon — Pixel Arcade Portfolio";
const description =
  "Play through the retro pixel portfolio of Franz Lyster L. Tagalogon: IT support technician, embedded systems programmer and freelance website developer.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background px-3 py-6 sm:px-6 sm:py-10">
      <GameStage />
      <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-lg text-muted-foreground">
          Arrows / A-D to move · Space to jump · E to interact
        </p>
        <Link to="/resume" className="pixel-btn bg-secondary text-foreground">
          VIEW RESUME
        </Link>
      </div>
    </main>
  );
}
