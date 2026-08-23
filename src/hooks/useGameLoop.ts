import { useEffect, type RefObject, type SetStateAction } from "react";
import {
  VIEW_W,
  WORLD_W,
  DIVE_GATE_X,
  UNDERWATER_MIN_X,
  UNDERWATER_SPAWN_X,
  UNDERWATER_SPAWN_Y,
  createPlayer,
  stepPlayer,
  playerCenter,
  drawBackground,
  drawPlayer,
  drawCoin,
  drawStation,
  drawPet,
  drawObstacle,
  drawCrevice,
  drawMovingBoss,
  zoneAt,
  type Appearance,
  type Input,
  type Station,
} from "@/components/game/engine";
import {
  STATIONS,
  OBSTACLES,
  SOLIDS,
  INITIAL_COINS,
  type Screen,
  type TransitionPhase,
} from "@/components/game/level";

type GameLoopOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  controlsRef: RefObject<Input>;
  pausedRef: RefObject<boolean>;
  nearRef: RefObject<Station | null>;
  screen: Screen;
  appearance: Appearance;
  onZoneChange: (zone: string) => void;
  onCollect: (update: SetStateAction<string[]>) => void;
  onPickup: (update: SetStateAction<string | null>) => void;
  onTransition: (phase: TransitionPhase) => void;
};

/**
 * Canvas game loop. Runs the physics tick, camera, dive cutscene state machine,
 * coin collection, and proximity detection inside a single requestAnimationFrame
 * loop. Reads pressed keys from `controlsRef.current` and pause state from
 * `pausedRef` without triggering React re-renders per frame.
 */
export function useGameLoop({
  canvasRef,
  controlsRef,
  pausedRef,
  nearRef,
  screen,
  appearance,
  onZoneChange,
  onCollect,
  onPickup,
  onTransition,
}: GameLoopOptions) {
  useEffect(() => {
    if (screen !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const player = createPlayer();
    const coins = INITIAL_COINS.map((c) => ({ ...c }));
    let camX = 0;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let lastZone = "";
    let transitionPhase: TransitionPhase = "none";
    let transitionStarted = 0;
    let shake = 0;
    let dived = false;
    let underwater = false;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!pausedRef.current) {
        elapsed += dt;
        if (transitionPhase === "none") {
          stepPlayer(
            player,
            controlsRef.current,
            dt,
            SOLIDS,
            underwater ? { minX: UNDERWATER_MIN_X } : {},
          );
          // Stepping off the edge of the dive gate drops the player immediately.
          if (!dived && player.x >= DIVE_GATE_X) {
            dived = true;
            player.vx = 0;
            transitionPhase = "collapse";
            transitionStarted = elapsed;
            onTransition("collapse");
          }
        } else if (transitionPhase === "collapse") {
          // Ground gives way: brief shake, then fall with horizontal input locked.
          shake = 4;
          if (elapsed - transitionStarted > 0.5) {
            transitionPhase = "falling";
            transitionStarted = elapsed;
            player.vy = 60;
            onTransition("falling");
          }
        } else if (transitionPhase === "falling") {
          shake = 2;
          player.x += player.vx * dt;
          player.y += player.vy * dt;
          player.vy += 200 * dt;
          player.anim += dt * 14;
          if (elapsed - transitionStarted > 1.3) {
            transitionPhase = "splash";
            transitionStarted = elapsed;
            onTransition("splash");
          }
        } else if (transitionPhase === "splash") {
          shake = 5;
          if (elapsed - transitionStarted > 0.6) {
            // Enter the underwater world and place the player at the spawn point.
            underwater = true;
            player.x = UNDERWATER_SPAWN_X;
            player.y = UNDERWATER_SPAWN_Y;
            player.vx = 0;
            player.vy = 0;
            transitionPhase = "blackout";
            transitionStarted = elapsed;
            onTransition("blackout");
          }
        } else if (transitionPhase === "blackout") {
          shake = 0;
          if (elapsed - transitionStarted > 1.4) {
            transitionPhase = "card";
            transitionStarted = elapsed;
            onTransition("card");
          }
        } else if (elapsed - transitionStarted > 1.8) {
          transitionPhase = "none";
          onTransition("none");
        }

        const cx = playerCenter(player);
        camX = Math.max(0, Math.min(cx - VIEW_W / 2, WORLD_W - VIEW_W));

        const z = zoneAt(cx);
        if (z !== lastZone) {
          lastZone = z;
          onZoneChange(z);
        }

        for (const c of coins) {
          if (c.taken) continue;
          if (Math.abs(c.x + 5 - cx) < 16 && Math.abs(c.y + 5 - (player.y + 11)) < 22) {
            c.taken = true;
            onCollect((prev) => (prev.includes(c.label) ? prev : [...prev, c.label]));
            onPickup(c.label);
            window.setTimeout(() => onPickup((p) => (p === c.label ? null : p)), 2200);
          }
        }

        let near: Station | null = null;
        for (const s of STATIONS) {
          if (Math.abs(s.x + 14 - cx) < 34) near = s;
        }
        nearRef.current = near;
      }

      ctx.save();
      if (shake > 0) {
        ctx.translate(
          Math.round((Math.random() - 0.5) * shake * 2),
          Math.round((Math.random() - 0.5) * shake * 2),
        );
      }
      drawBackground(ctx, camX, underwater);
      if (!underwater) drawCrevice(ctx, camX);
      for (const obstacle of OBSTACLES) drawObstacle(ctx, obstacle, camX, elapsed);
      for (const s of STATIONS) drawStation(ctx, s, camX, elapsed, nearRef.current?.id === s.id);
      drawMovingBoss(ctx, "golem", 4540, camX, elapsed);
      drawMovingBoss(ctx, "angler", 6080, camX, elapsed);
      drawMovingBoss(ctx, "fish", 6400, camX, elapsed);
      drawMovingBoss(ctx, "kraken", 7240, camX, elapsed);
      for (const c of coins) if (!c.taken) drawCoin(ctx, c, camX, elapsed);
      drawPet(ctx, player, camX, elapsed, appearance);
      drawPlayer(ctx, player, camX, appearance);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [
    screen,
    appearance,
    onZoneChange,
    onCollect,
    onPickup,
    onTransition,
    canvasRef,
    controlsRef,
    pausedRef,
    nearRef,
  ]);
}
