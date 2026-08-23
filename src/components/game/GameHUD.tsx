export function GameHUD({
  zone,
  collected,
  total,
  pickup,
  showPickup,
  onCustomize,
}: {
  zone: string;
  collected: string[];
  total: number;
  pickup: string | null;
  showPickup: boolean;
  onCustomize: () => void;
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2 sm:p-3">
        <div className="border-4 border-border bg-screen/85 px-2 py-1">
          <p className="font-display text-[0.45rem] text-accent sm:text-[0.55rem]">{zone}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="pointer-events-auto border-4 border-border bg-screen/85 px-2 py-1 font-display text-[0.42rem] text-foreground"
            onClick={onCustomize}
            aria-label="Customize character and pet"
          >
            CREW
          </button>
          <div className="border-4 border-border bg-screen/85 px-2 py-1">
            <p className="font-display text-[0.45rem] text-cyan-crt sm:text-[0.55rem]">
              SKILLS {collected.length}/{total}
            </p>
          </div>
        </div>
      </div>

      {pickup && showPickup && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 border-4 border-accent bg-screen/90 px-3 py-2 text-center">
          <p className="font-display text-[0.5rem] text-accent">SKILL UNLOCKED</p>
          <p className="text-lg text-foreground">{pickup}</p>
        </div>
      )}
    </>
  );
}
