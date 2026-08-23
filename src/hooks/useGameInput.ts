import { useEffect, useRef, type RefObject } from "react";
import type { Input } from "@/components/game/engine";
import type { Dialog } from "@/components/game/dialogs/types";

type GameInputOptions = {
  /** Latest dialog value so E/Enter only interacts while no dialog is open. */
  dialogRef: RefObject<Dialog>;
  onInteract: () => void;
  onCancel: () => void;
};

/**
 * Keyboard controls for the platformer. Maintains a single mutable `controlsRef`
 * of pressed keys (no React state) that the game loop polls every frame.
 * `E`/`Enter` triggers `onInteract` (unless a dialog is open) and `Escape`
 * triggers `onCancel`. The keydown/keyup listeners are cleaned up on unmount.
 */
export function useGameInput({ dialogRef, onInteract, onCancel }: GameInputOptions) {
  const controlsRef = useRef<Input>({ left: false, right: false, jump: false });
  const onInteractRef = useRef(onInteract);
  const onCancelRef = useRef(onCancel);
  onInteractRef.current = onInteract;
  onCancelRef.current = onCancel;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(k))
        e.preventDefault();
      if (k === "arrowleft" || k === "a") controlsRef.current.left = true;
      if (k === "arrowright" || k === "d") controlsRef.current.right = true;
      if (k === "arrowup" || k === "w" || k === " ") controlsRef.current.jump = true;
      if (k === "e" || k === "enter") {
        if (!dialogRef.current) onInteractRef.current();
      }
      if (k === "escape") onCancelRef.current();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") controlsRef.current.left = false;
      if (k === "arrowright" || k === "d") controlsRef.current.right = false;
      if (k === "arrowup" || k === "w" || k === " ") controlsRef.current.jump = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [dialogRef]);

  return controlsRef;
}
