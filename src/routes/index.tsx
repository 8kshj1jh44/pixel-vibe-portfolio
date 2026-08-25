import { createFileRoute, Link } from "@tanstack/react-router";
import { GameStage } from "@/components/game/GameStage";

const title = "Franz Lyster — Underwater Pixel Portfolio";
const description =
  "Play Franz Lyster's retro portfolio: explore two pixel worlds, face underwater challenges, discover credentials, and get in touch.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:franzlyster@gmail.com?subject=Let%27s%20work%20together"
            className="pixel-btn bg-primary text-primary-foreground"
          >
            CONTACT ME
          </a>
          <Link to="/resume" className="pixel-btn bg-secondary text-foreground">
            VIEW RESUME
          </Link>
        </div>
      </div>
    </main>
  );
}
