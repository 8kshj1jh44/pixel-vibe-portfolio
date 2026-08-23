import type { TransitionPhase } from "@/components/game/level";

export function TransitionOverlays({ transition }: { transition: TransitionPhase }) {
  return (
    <>
      {transition === "collapse" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-primary/20">
          <p className="font-display text-[0.6rem] text-accent sm:text-sm">THE FLOOR GIVES WAY!</p>
        </div>
      )}
      {transition === "falling" && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center">
          <p className="font-display text-[0.55rem] text-accent sm:text-xs">FAAALLLIIING...</p>
        </div>
      )}
      {transition === "splash" && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-cyan-crt/40">
          <p className="font-display text-[0.7rem] text-screen sm:text-base">SPLASH!</p>
        </div>
      )}
      {transition === "blackout" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-screen">
          <p className="blink font-display text-[0.55rem] text-cyan-crt">SIGNAL LOST...</p>
        </div>
      )}
      {transition === "card" && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-screen/70">
          <p className="font-display text-[0.5rem] text-cyan-crt">LEVEL 2</p>
          <p className="text-glow font-display text-xs text-accent sm:text-lg">THE DEEP ARCHIVE</p>
        </div>
      )}
    </>
  );
}
