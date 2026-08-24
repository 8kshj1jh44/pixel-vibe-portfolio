import { useCallback, useRef, useState } from "react";
import { VIEW_W, VIEW_H, zoneAt, type BossKind, type Station } from "./engine";
import type { Screen, TransitionPhase } from "./level";
import { useGameInput } from "@/hooks/useGameInput";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useAppearance } from "@/hooks/useAppearance";
import { TitleScreen } from "./TitleScreen";
import { RulesScreen } from "./RulesScreen";
import { CustomizerModal } from "./CustomizerModal";
import { GameHUD } from "./GameHUD";
import { TouchControls } from "./TouchControls";
import { TransitionOverlays } from "./TransitionOverlays";
import { DialogHost, type Dialog } from "./dialogs/DialogHost";
import { openStationDialog } from "./dialogs/dialogUtils";
import { skills } from "@/content/portfolio";
import landscape from "@/assets/pixel-landscape.jpg";

export function GameStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<Screen>("title");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [zone, setZone] = useState(zoneAt(0));
  const [collected, setCollected] = useState<string[]>([]);
  const [pickup, setPickup] = useState<string | null>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [challengeError, setChallengeError] = useState("");
  const [transition, setTransition] = useState<TransitionPhase>("none");
  const [completedBosses, setCompletedBosses] = useState<BossKind[]>([]);
  const { appearance, updateAppearance } = useAppearance();

  const pausedRef = useRef(false);
  const dialogRef = useRef<Dialog>(null);
  const nearRef = useRef<Station | null>(null);
  const completedBossesRef = useRef<BossKind[]>([]);
  const challengeRef = useRef(false);

  pausedRef.current = screen !== "playing" || dialog !== null;
  dialogRef.current = dialog;
  completedBossesRef.current = completedBosses;
  challengeRef.current = dialog?.type === "challenge" && dialog.step !== "success";

  const openStation = useCallback(
    (s: Station) => {
      setDialog(openStationDialog(s, completedBosses));
    },
    [completedBosses],
  );

  const interact = useCallback(() => {
    const s = nearRef.current;
    if (s) openStation(s);
  }, [openStation]);

  const advanceChallenge = useCallback((boss: BossKind, correct: boolean) => {
    if (!correct) {
      setChallengeError("MISS! Try another answer.");
      return;
    }
    setChallengeError("");
    setChallengeProgress((progress) => {
      const next = progress + 1;
      if (next >= 4) {
        setCompletedBosses((done) => (done.includes(boss) ? done : [...done, boss]));
        setDialog({ type: "challenge", boss, step: "success" });
        return 4;
      }
      return next;
    });
  }, []);

  const startChallenge = useCallback((boss: BossKind) => {
    setChallengeProgress(0);
    setChallengeError("");
    setDialog({ type: "challenge", boss, step: "active" });
  }, []);

  const closeDialog = useCallback(() => setDialog(null), []);

  const controlsRef = useGameInput({ dialogRef, onInteract: interact, onCancel: closeDialog });

  useGameLoop({
    canvasRef,
    controlsRef,
    pausedRef,
    nearRef,
    completedRef: completedBossesRef,
    challengeRef,
    screen,
    appearance,
    onZoneChange: setZone,
    onCollect: setCollected,
    onPickup: setPickup,
    onTransition: setTransition,
  });

  return (
    <div className="scanlines relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden border-4 border-border bg-screen">
      {screen === "playing" ? (
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          className="h-full w-full"
          aria-label="Pixel platformer portfolio level"
        />
      ) : (
        <img
          src={landscape}
          alt="Pixel art sunset landscape"
          width={1536}
          height={896}
          className="h-full w-full object-cover"
        />
      )}

      {screen === "playing" && (
        <GameHUD
          zone={zone}
          collected={collected}
          total={skills.length}
          pickup={pickup}
          showPickup={dialog === null}
          onCustomize={() => setScreen("customize")}
        />
      )}

      <TransitionOverlays transition={transition} />

      {screen === "playing" && dialog === null && (
        <TouchControls controlsRef={controlsRef} onInteract={interact} />
      )}

      {screen === "title" && (
        <TitleScreen
          onStart={() => setScreen("customize")}
          onRules={() => setScreen("rules")}
          onContact={() => setDialog({ type: "contact" })}
          onProjects={() => setDialog({ type: "projects" })}
        />
      )}

      {screen === "customize" && (
        <CustomizerModal
          appearance={appearance}
          onChange={updateAppearance}
          onPlay={() => setScreen("playing")}
          onBack={() => setScreen("title")}
        />
      )}

      {screen === "rules" && (
        <RulesScreen onCustomize={() => setScreen("customize")} onBack={() => setScreen("title")} />
      )}

      <DialogHost
        dialog={dialog}
        collected={collected}
        challengeProgress={challengeProgress}
        challengeError={challengeError}
        onNavigate={setDialog}
        onStartChallenge={startChallenge}
        onAnswerChallenge={advanceChallenge}
        onClose={closeDialog}
      />
    </div>
  );
}
