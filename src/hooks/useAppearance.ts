import { useCallback, useEffect, useState } from "react";
import type { Appearance } from "@/components/game/engine";

const APPEARANCE_KEY = "franz-arcade-appearance";

const DEFAULT_APPEARANCE: Appearance = {
  palette: "aqua",
  accessory: "mask",
  pet: "fish",
  petColor: "coral",
};

/** Character/pet customization state, hydrated from and persisted to localStorage. */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const saved = window.localStorage.getItem(APPEARANCE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Appearance;
      if (parsed.palette && parsed.accessory && parsed.pet && parsed.petColor)
        setAppearance(parsed);
    } catch {
      window.localStorage.removeItem(APPEARANCE_KEY);
    }
  }, []);

  const updateAppearance = useCallback((next: Appearance) => {
    setAppearance(next);
    window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
  }, []);

  return { appearance, updateAppearance };
}
