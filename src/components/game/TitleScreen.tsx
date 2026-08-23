import { Link } from "@tanstack/react-router";

export function TitleScreen({
  onStart,
  onRules,
  onContact,
  onProjects,
}: {
  onStart: () => void;
  onRules: () => void;
  onContact: () => void;
  onProjects: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto bg-screen/95 px-4 py-6 text-center sm:absolute sm:bg-screen/70 sm:py-0">
      <p className="font-display text-[0.5rem] text-cyan-crt sm:text-xs">LET&apos;S PLAY</p>
      <h1 className="text-glow mt-3 font-display text-xl text-accent sm:text-4xl">FRANZ LYSTER</h1>
      <p className="mt-3 max-w-md text-lg text-foreground sm:text-xl">
        IT Support · Embedded Systems · Vibe-Coding Web Developer
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button className="pixel-btn bg-primary text-primary-foreground" onClick={onStart}>
          START
        </button>
        <button className="pixel-btn bg-secondary text-foreground" onClick={onRules}>
          RULES
        </button>
        <Link to="/resume" className="pixel-btn bg-accent text-accent-foreground">
          SKIP GAME
        </Link>
        <button className="pixel-btn bg-primary text-primary-foreground" onClick={onContact}>
          HIRE ME
        </button>
        <button className="pixel-btn bg-secondary text-foreground" onClick={onProjects}>
          VIEW PROJECTS
        </button>
      </div>
      <p className="blink mt-4 font-display text-[0.5rem] text-foreground sm:mt-6">PRESS START</p>
    </div>
  );
}
