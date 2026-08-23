import type { PointerEvent, RefObject } from "react";
import type { Input } from "@/components/game/engine";

export function TouchControls({
  controlsRef,
  onInteract,
}: {
  controlsRef: RefObject<Input>;
  onInteract: () => void;
}) {
  const hold = (key: keyof Input, value: boolean) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      controlsRef.current[key] = value;
    },
    onPointerUp: () => {
      controlsRef.current[key] = false;
    },
    onPointerLeave: () => {
      controlsRef.current[key] = false;
    },
    onPointerCancel: () => {
      controlsRef.current[key] = false;
    },
  });

  return (
    <div className="touch-controls absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-3 select-none sm:hidden">
      <div className="flex gap-2">
        <button
          className="pixel-btn touch-key bg-secondary text-foreground"
          aria-label="Move left"
          {...hold("left", true)}
        >
          ◀
        </button>
        <button
          className="pixel-btn touch-key bg-secondary text-foreground"
          aria-label="Move right"
          {...hold("right", true)}
        >
          ▶
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="pixel-btn touch-key bg-accent text-accent-foreground"
          aria-label="Interact"
          onClick={onInteract}
        >
          ACT
        </button>
        <button
          className="pixel-btn touch-key bg-primary text-primary-foreground"
          aria-label="Jump"
          {...hold("jump", true)}
        >
          ▲
        </button>
      </div>
    </div>
  );
}
