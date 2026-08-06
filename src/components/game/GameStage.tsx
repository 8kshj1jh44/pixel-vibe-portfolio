import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  VIEW_W,
  VIEW_H,
  GROUND_Y,
  WORLD_W,
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
  type Coin,
  type Station,
  type Appearance,
  type Obstacle,
  type BossKind,
  type CharacterPalette,
  type CharacterAccessory,
  type PetSpecies,
} from "./engine";
import { PixelDialog } from "./PixelDialog";
import { ContactTerminal } from "./ContactTerminal";
import {
  profile,
  skills,
  jobs,
  projects,
  education,
  certifications,
  technicalTools,
} from "@/content/portfolio";
import landscape from "@/assets/pixel-landscape.jpg";

type TransitionPhase = "none" | "quake" | "collapse" | "falling" | "splash" | "blackout" | "card";

type Screen = "title" | "rules" | "customize" | "playing";
type Dialog =
  | { type: "about" }
  | { type: "skills" }
  | { type: "job"; index: number }
  | { type: "project"; index: number }
  | { type: "projects" }
  | { type: "education" }
  | { type: "certifications" }
  | { type: "tools" }
  | { type: "challenge"; boss: BossKind; step: "intro" | "active" | "success" }
  | { type: "contact" }
  | { type: "end" }
  | null;

const STATIONS: Station[] = [
  { id: "about", kind: "sign", x: 240, label: "ABOUT ME" },
  { id: "skills", kind: "sign", x: 960, label: "SKILLS" },
  ...jobs.map((_, i) => ({
    id: `job-${i}`,
    kind: "sign" as const,
    x: 2420 + i * 300,
    label: `JOB 0${i + 1}`,
  })),
  ...projects.map((p, i) => ({
    id: `project-${i}`,
    kind: "cabinet" as const,
    x: 3840 + i * 300,
    label: p.label,
  })),
  { id: "education", kind: "sign", x: 5580, label: "EDUCATION" },
  { id: "certifications", kind: "sign", x: 5900, label: "CERTS" },
  { id: "golem", kind: "boss", x: 4540, label: "SIGNAL GOLEM" },
  { id: "angler", kind: "boss", x: 6080, label: "ANGLERFISH" },
  { id: "fish", kind: "boss", x: 6400, label: "BIG FISH" },
  { id: "tools", kind: "sign", x: 6860, label: "TOOLS" },
  { id: "kraken", kind: "boss", x: 7240, label: "KRAKEN" },
  { id: "contact", kind: "terminal", x: 7600, label: "CONTACT" },
  { id: "end", kind: "flag", x: 7800, label: "GOAL" },
];

const OBSTACLES: Obstacle[] = [
  { id: "crate-1", x: 620, width: 28, height: 28, kind: "crate" },
  { id: "spikes-1", x: 1510, width: 42, height: 8, kind: "spikes" },
  { id: "crate-2", x: 2860, width: 34, height: 34, kind: "crate" },
  { id: "spikes-2", x: 4380, width: 50, height: 8, kind: "spikes" },
  { id: "mine-1", x: 5700, width: 28, height: 24, kind: "mine" },
  { id: "coral-1", x: 6120, width: 42, height: 26, kind: "coral" },
  { id: "mine-2", x: 6750, width: 30, height: 26, kind: "mine" },
  { id: "coral-2", x: 7080, width: 46, height: 30, kind: "coral" },
  { id: "crate-3", x: 1180, width: 30, height: 30, kind: "crate" },
  { id: "crate-4", x: 1230, width: 30, height: 58, kind: "crate" },
  { id: "crate-5", x: 3320, width: 32, height: 44, kind: "crate" },
];

/** Crates and coral are solid platforms you can stand on. */
const SOLIDS = OBSTACLES.filter((o) => o.kind === "crate" || o.kind === "coral");

const BOSS_IDS: BossKind[] = ["fish", "kraken", "golem", "angler"];

const BOSS_TITLES: Record<BossKind, string> = {
  fish: "BIG FISH",
  kraken: "KRAKEN",
  golem: "SIGNAL GOLEM",
  angler: "ANGLERFISH",
};

const INITIAL_COINS: Coin[] = skills.map((label, i) => ({
  id: `skill-${i}`,
  x: 1120 + i * 130,
  y: GROUND_Y - (i % 2 === 0 ? 60 : 96),
  taken: false,
  label,
}));

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
  const [appearance, setAppearance] = useState<Appearance>({
    palette: "aqua",
    accessory: "mask",
    pet: "fish",
    petColor: "coral",
  });

  const inputRef = useRef({ left: false, right: false, jump: false });
  const pausedRef = useRef(false);
  const dialogRef = useRef<Dialog>(null);
  const nearRef = useRef<Station | null>(null);

  pausedRef.current = screen !== "playing" || dialog !== null;
  dialogRef.current = dialog;

  useEffect(() => {
    const saved = window.localStorage.getItem("franz-arcade-appearance");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Appearance;
      if (parsed.palette && parsed.accessory && parsed.pet && parsed.petColor) setAppearance(parsed);
    } catch {
      window.localStorage.removeItem("franz-arcade-appearance");
    }
  }, []);

  const updateAppearance = useCallback((next: Appearance) => {
    setAppearance(next);
    window.localStorage.setItem("franz-arcade-appearance", JSON.stringify(next));
  }, []);

  const openStation = useCallback((s: Station) => {
    if (s.id === "about") setDialog({ type: "about" });
    else if (s.id === "skills") setDialog({ type: "skills" });
    else if (s.id === "contact") setDialog({ type: "contact" });
    else if (s.id === "end") setDialog({ type: "end" });
    else if (s.id === "education") setDialog({ type: "education" });
    else if (s.id === "certifications") setDialog({ type: "certifications" });
    else if (s.id === "tools") setDialog({ type: "tools" });
    else if (BOSS_IDS.includes(s.id as BossKind)) {
      const boss = s.id as BossKind;
      if (completedBosses.includes(boss)) setDialog({ type: "challenge", boss, step: "success" });
      else setDialog({ type: "challenge", boss, step: "intro" });
    }
    else if (s.id.startsWith("job-")) setDialog({ type: "job", index: Number(s.id.slice(4)) });
    else if (s.id.startsWith("project-"))
      setDialog({ type: "project", index: Number(s.id.slice(8)) });
  }, [completedBosses]);

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

  const interact = useCallback(() => {
    const s = nearRef.current;
    if (s) openStation(s);
  }, [openStation]);

  /* Keyboard */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(k)) e.preventDefault();
      if (k === "arrowleft" || k === "a") inputRef.current.left = true;
      if (k === "arrowright" || k === "d") inputRef.current.right = true;
      if (k === "arrowup" || k === "w" || k === " ") inputRef.current.jump = true;
      if (k === "e" || k === "enter") {
        if (!dialogRef.current) interact();
      }
      if (k === "escape") setDialog(null);
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") inputRef.current.left = false;
      if (k === "arrowright" || k === "d") inputRef.current.right = false;
      if (k === "arrowup" || k === "w" || k === " ") inputRef.current.jump = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [interact]);

  /* Game loop */
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

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!pausedRef.current) {
        elapsed += dt;
        if (transitionPhase === "none") {
          stepPlayer(player, inputRef.current, dt, SOLIDS);
          if (!dived && player.x >= 5040) {
            dived = true;
            transitionPhase = "quake";
            transitionStarted = elapsed;
            setTransition("quake");
          }
        } else if (transitionPhase === "quake") {
          stepPlayer(player, { left: false, right: true, jump: false }, dt, SOLIDS);
          shake = 3;
          if (elapsed - transitionStarted > 1.4) {
            transitionPhase = "collapse";
            transitionStarted = elapsed;
            setTransition("collapse");
          }
        } else if (transitionPhase === "collapse") {
          shake = 6;
          player.vx = 0;
          if (elapsed - transitionStarted > 0.7) {
            transitionPhase = "falling";
            transitionStarted = elapsed;
            player.vx = 26;
            player.vy = 70;
            setTransition("falling");
          }
        } else if (transitionPhase === "falling") {
          shake = 2;
          player.x += player.vx * dt;
          player.y += player.vy * dt;
          player.vy += 200 * dt;
          player.anim += dt * 14;
          if (elapsed - transitionStarted > 1.5) {
            transitionPhase = "splash";
            transitionStarted = elapsed;
            setTransition("splash");
          }
        } else if (transitionPhase === "splash") {
          shake = 5;
          if (elapsed - transitionStarted > 0.6) {
            transitionPhase = "blackout";
            transitionStarted = elapsed;
            setTransition("blackout");
          }
        } else if (transitionPhase === "blackout") {
          shake = 0;
          if (elapsed - transitionStarted > 1.4) {
            transitionPhase = "card";
            transitionStarted = elapsed;
            player.x = 5420;
            player.y = GROUND_Y - 22;
            player.vx = 0;
            player.vy = 0;
            setTransition("card");
          }
        } else if (elapsed - transitionStarted > 1.8) {
          transitionPhase = "none";
          setTransition("none");
        }

        const cx = playerCenter(player);
        camX = Math.max(0, Math.min(cx - VIEW_W / 2, WORLD_W - VIEW_W));

        const z = zoneAt(cx);
        if (z !== lastZone) {
          lastZone = z;
          setZone(z);
        }

        for (const c of coins) {
          if (c.taken) continue;
          if (Math.abs(c.x + 5 - cx) < 16 && Math.abs(c.y + 5 - (player.y + 11)) < 22) {
            c.taken = true;
            setCollected((prev) => (prev.includes(c.label) ? prev : [...prev, c.label]));
            setPickup(c.label);
            window.setTimeout(() => setPickup((p) => (p === c.label ? null : p)), 2200);
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
      drawBackground(ctx, camX);
      drawCrevice(ctx, camX);
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
  }, [screen, appearance]);

  const hold = (key: "left" | "right" | "jump", value: boolean) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      inputRef.current[key] = value;
    },
    onPointerUp: () => {
      inputRef.current[key] = false;
    },
    onPointerLeave: () => {
      inputRef.current[key] = false;
    },
    onPointerCancel: () => {
      inputRef.current[key] = false;
    },
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

      {/* HUD */}
      {screen === "playing" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2 sm:p-3">
          <div className="border-4 border-border bg-screen/85 px-2 py-1">
            <p className="font-display text-[0.45rem] text-accent sm:text-[0.55rem]">{zone}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="pointer-events-auto border-4 border-border bg-screen/85 px-2 py-1 font-display text-[0.42rem] text-foreground"
              onClick={() => setScreen("customize")}
              aria-label="Customize character and pet"
            >
              CREW
            </button>
            <div className="border-4 border-border bg-screen/85 px-2 py-1">
            <p className="font-display text-[0.45rem] text-cyan-crt sm:text-[0.55rem]">
              SKILLS {collected.length}/{skills.length}
            </p>
            </div>
          </div>
        </div>
      )}

      {transition === "quake" && (
        <div className="pointer-events-none absolute inset-x-0 top-1/4 z-20 text-center">
          <p className="blink font-display text-[0.55rem] text-accent sm:text-xs">!! THE GROUND IS CRACKING !!</p>
        </div>
      )}
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

      {pickup && screen === "playing" && !dialog && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 w-[90%] max-w-md -translate-x-1/2 border-4 border-accent bg-screen/90 px-3 py-2 text-center">
          <p className="font-display text-[0.5rem] text-accent">SKILL UNLOCKED</p>
          <p className="text-lg text-foreground">{pickup}</p>
        </div>
      )}

      {/* Touch controls */}
      {screen === "playing" && !dialog && (
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
              onClick={interact}
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
      )}

      {/* Title screen */}
      {screen === "title" && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto bg-screen/95 px-4 py-6 text-center sm:absolute sm:bg-screen/70 sm:py-0">
          <p className="font-display text-[0.5rem] text-cyan-crt sm:text-xs">LET&apos;S PLAY</p>
          <h1 className="text-glow mt-3 font-display text-xl text-accent sm:text-4xl">
            FRANZ LYSTER
          </h1>
          <p className="mt-3 max-w-md text-lg text-foreground sm:text-xl">
            IT Support · Embedded Systems · Vibe-Coding Web Developer
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              className="pixel-btn bg-primary text-primary-foreground"
              onClick={() => setScreen("customize")}
            >
              START
            </button>
            <button
              className="pixel-btn bg-secondary text-foreground"
              onClick={() => setScreen("rules")}
            >
              RULES
            </button>
            <Link to="/resume" className="pixel-btn bg-accent text-accent-foreground">
              SKIP GAME
            </Link>
            <button
              className="pixel-btn bg-primary text-primary-foreground"
              onClick={() => setDialog({ type: "contact" })}
            >
              HIRE ME
            </button>
            <button
              className="pixel-btn bg-secondary text-foreground"
              onClick={() => setDialog({ type: "projects" })}
            >
              VIEW PROJECTS
            </button>
          </div>
          <p className="blink mt-4 font-display text-[0.5rem] text-foreground sm:mt-6">PRESS START</p>
        </div>
      )}

      {screen === "customize" && (
        <Customizer
          appearance={appearance}
          onChange={updateAppearance}
          onPlay={() => setScreen("playing")}
          onBack={() => setScreen("title")}
        />
      )}

      {/* Rules screen */}
      {screen === "rules" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-screen/85 p-4">
          <div className="pixel-box w-full max-w-lg bg-card p-5">
            <h2 className="font-display text-xs text-accent">ARE YOU READY?</h2>
            <ul className="mt-4 space-y-1 text-lg">
              <li>◆ ARROWS or A / D — move</li>
              <li>◆ SPACE, W or ▲ — jump</li>
              <li>◆ E or ENTER — read a signpost, arcade cabinet or terminal</li>
              <li>◆ ESC — close a dialog</li>
              <li>◆ Grab the floating coins to unlock skills</li>
              <li>◆ On mobile, use the on-screen buttons</li>
            </ul>
            <div className="mt-5 flex gap-3">
              <button
                className="pixel-btn bg-primary text-primary-foreground"
                onClick={() => setScreen("customize")}
              >
                YES
              </button>
              <button
                className="pixel-btn bg-secondary text-foreground"
                onClick={() => setScreen("title")}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {dialog?.type === "about" && (
        <PixelDialog title="ABOUT THE PLAYER" onClose={() => setDialog(null)}>
          <h3 className="font-display text-[0.6rem] text-accent">{profile.name}</h3>
          <p className="mt-2 text-cyan-crt">{profile.title}</p>
          <p className="text-cyan-crt">
            {profile.phone} · {profile.email}
          </p>
          <p className="mt-3">{profile.summary}</p>
        </PixelDialog>
      )}

      {dialog?.type === "skills" && (
        <PixelDialog title="SKILL INVENTORY" onClose={() => setDialog(null)}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {skills.map((s) => (
              <li key={s} className="border-4 border-border bg-secondary px-3 py-2">
                <span className="text-accent">★</span> {s}
                {collected.includes(s) && (
                  <span className="ml-2 font-display text-[0.45rem] text-lime-crt">GOT IT</span>
                )}
              </li>
            ))}
          </ul>
        </PixelDialog>
      )}

      {dialog?.type === "job" && (
        <PixelDialog title={`WORK HISTORY 0${dialog.index + 1}`} onClose={() => setDialog(null)}>
          <h3 className="font-display text-[0.6rem] text-accent">{jobs[dialog.index]!.role}</h3>
          {jobs[dialog.index]!.company && (
            <p className="text-cyan-crt">{jobs[dialog.index]!.company}</p>
          )}
          <p className="text-muted-foreground">{jobs[dialog.index]!.period}</p>
          <ul className="mt-3 space-y-1">
            {jobs[dialog.index]!.bullets.map((b) => (
              <li key={b}>▪ {b}</li>
            ))}
          </ul>
        </PixelDialog>
      )}

      {dialog?.type === "project" && (
        <PixelDialog
          title={`SNEAK PEEK — ${projects[dialog.index]!.label}`}
          onClose={() => setDialog(null)}
          footer={
            projects[dialog.index]!.url ? (
              <a
                href={projects[dialog.index]!.url}
                target="_blank"
                rel="noreferrer noopener"
                className="pixel-btn bg-primary text-primary-foreground"
              >
                VISIT SITE
              </a>
            ) : (
              <span className="font-display text-[0.5rem] text-accent">COMING SOON</span>
            )
          }
        >
          <ProjectPeek index={dialog.index} />
        </PixelDialog>
      )}

      {dialog?.type === "projects" && (
        <PixelDialog title="DELIVERED WEBSITES" onClose={() => setDialog(null)}>
          <div className="grid gap-3 sm:grid-cols-3">
            {projects.map((project, index) => (
              <button
                type="button"
                key={project.label}
                onClick={() => setDialog({ type: "project", index })}
                className="border-4 border-border bg-secondary p-2 text-left active:translate-y-1"
              >
                <img src={project.image} alt={`${project.name} preview`} className="h-24 w-full object-cover" />
                <span className="mt-2 block font-display text-[0.45rem] text-accent">{project.name}</span>
              </button>
            ))}
          </div>
        </PixelDialog>
      )}

      {dialog?.type === "education" && (
        <PixelDialog title="DEEP ARCHIVE — EDUCATION" onClose={() => setDialog(null)}>
          <h3 className="font-display text-[0.6rem] text-accent">{education.degree}</h3>
          <p className="mt-2 text-cyan-crt">{education.school}</p>
          <p className="mt-2 text-muted-foreground">{education.period}</p>
        </PixelDialog>
      )}

      {dialog?.type === "certifications" && (
        <PixelDialog title="CERTIFICATION VAULT" onClose={() => setDialog(null)}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {certifications.map((cert) => (
              <li key={cert.name} className="border-4 border-border bg-secondary px-3 py-3">
                <strong className="text-accent">{cert.name}</strong>
                {cert.issuer && <span className="block text-cyan-crt">{cert.issuer}</span>}
                <span className="block text-muted-foreground">{cert.date}</span>
              </li>
            ))}
          </ul>
        </PixelDialog>
      )}

      {dialog?.type === "tools" && (
        <PixelDialog title="TOOL REEF" onClose={() => setDialog(null)}>
          <ul className="flex flex-wrap gap-2">
            {technicalTools.map((tool) => (
              <li key={tool} className="border-4 border-border bg-secondary px-3 py-2">
                <span className="text-cyan-crt">◆</span> {tool}
              </li>
            ))}
          </ul>
        </PixelDialog>
      )}

      {dialog?.type === "challenge" && (
        <ChallengeDialog
          boss={dialog.boss}
          step={dialog.step}
          progress={challengeProgress}
          error={challengeError}
          onStart={() => {
            setChallengeProgress(0);
            setChallengeError("");
            setDialog({ type: "challenge", boss: dialog.boss, step: "active" });
          }}
          onAnswer={(correct) => advanceChallenge(dialog.boss, correct)}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.type === "contact" && (
        <PixelDialog title="CONTACT TERMINAL" onClose={() => setDialog(null)}>
          <ContactTerminal />
        </PixelDialog>
      )}

      {dialog?.type === "end" && (
        <PixelDialog
          title="STAGE CLEAR"
          onClose={() => setDialog(null)}
          footer={
            <button
              type="button"
              className="pixel-btn bg-primary text-primary-foreground"
              onClick={() => setDialog({ type: "contact" })}
            >
              HIRE / CONTACT ME
            </button>
          }
        >
          <h3 className="text-glow font-display text-base text-accent">THANK YOU</h3>
          <p className="mt-3">
            You reached the flag with {collected.length} of {skills.length} skills collected.
            Thanks for playing through my portfolio — let&apos;s build something together.
          </p>
          <p className="mt-2 text-cyan-crt">
            {profile.phone} · {profile.email}
          </p>
        </PixelDialog>
      )}
    </div>
  );
}

function Customizer({
  appearance,
  onChange,
  onPlay,
  onBack,
}: {
  appearance: Appearance;
  onChange: (value: Appearance) => void;
  onPlay: () => void;
  onBack: () => void;
}) {
  const palettes: CharacterPalette[] = ["coral", "aqua", "lime"];
  const accessories: CharacterAccessory[] = ["mask", "cap", "headset"];
  const pets: PetSpecies[] = ["fish", "turtle", "octopus"];
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-screen/95 p-3 sm:absolute sm:bg-screen/90">
      <div className="pixel-box w-full max-w-2xl bg-card p-4 sm:p-6">
        <h2 className="font-display text-xs text-accent">CUSTOMIZE YOUR CREW</h2>
        <CustomizerRow label="SUIT COLOR" options={palettes} value={appearance.palette} onPick={(palette) => onChange({ ...appearance, palette })} />
        <CustomizerRow label="ACCESSORY" options={accessories} value={appearance.accessory} onPick={(accessory) => onChange({ ...appearance, accessory })} />
        <CustomizerRow label="PET" options={pets} value={appearance.pet} onPick={(pet) => onChange({ ...appearance, pet })} />
        <CustomizerRow label="PET COLOR" options={palettes} value={appearance.petColor} onPick={(petColor) => onChange({ ...appearance, petColor })} />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="pixel-btn bg-primary text-primary-foreground" onClick={onPlay}>PLAY</button>
          <button type="button" className="pixel-btn bg-secondary text-foreground" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}

function CustomizerRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: T[];
  value: T;
  onPick: (option: T) => void;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="font-display text-[0.5rem] text-cyan-crt">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onPick(option)}
            className={`pixel-btn ${value === option ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ChallengeDialog({
  boss,
  step,
  progress,
  error,
  onStart,
  onAnswer,
  onClose,
}: {
  boss: BossKind;
  step: "intro" | "active" | "success";
  progress: number;
  error: string;
  onStart: () => void;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}) {
  const trivia = getDailyTrivia(boss);
  const current = trivia[progress];
  const life = Math.max(0, 4 - progress);
  return (
    <PixelDialog
      title={`${BOSS_TITLES[boss]} — DAILY TRIVIA`}
      onClose={onClose}
      footer={step === "intro" ? <button type="button" className="pixel-btn bg-primary text-primary-foreground" onClick={onStart}>START CHALLENGE</button> : undefined}
    >
      <div className="mb-4" aria-label={`Boss life ${life} of 4`}>
        <div className="flex items-center justify-between font-display text-[0.48rem]">
          <span className="text-accent">BOSS LIFE</span>
          <span className="text-cyan-crt">{life}/4</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 border-4 border-border bg-screen p-1">
          {[0, 1, 2, 3].map((heart) => (
            <span key={heart} className={`h-3 ${heart < life ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
      {step === "intro" && <p>Answer today&apos;s four technology and ocean trivia questions. Each correct answer removes one life point; the question set changes each day.</p>}
      {step === "active" && (
        <div>
          <p className="font-display text-[0.55rem] text-cyan-crt">STEP {progress + 1} / 4</p>
          {current && (
            <>
              <p className="my-4 border-4 border-accent bg-screen p-4 text-xl text-foreground">{current.question}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {current.options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    className="pixel-btn min-h-14 bg-secondary text-foreground"
                    onClick={() => onAnswer(index === current.answer)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && <p className="mt-3 text-destructive">! {error}</p>}
        </div>
      )}
      {step === "success" && (
        <div>
          <h3 className="font-display text-sm text-lime-crt">CHALLENGE CLEAR</h3>
          <p className="mt-3">The route ahead is open. Continue deeper into the portfolio.</p>
        </div>
      )}
    </PixelDialog>
  );
}

type TriviaQuestion = { question: string; options: string[]; answer: number };

const TRIVIA_SETS: TriviaQuestion[][] = [
  [
    { question: "Which protocol translates domain names into IP addresses?", options: ["DNS", "SSH", "FTP"], answer: 0 },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Pacific", "Indian"], answer: 1 },
    { question: "Which command lists files on Linux?", options: ["ls", "pwd", "ping"], answer: 0 },
    { question: "An octopus has how many arms?", options: ["Six", "Eight", "Ten"], answer: 1 },
  ],
  [
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Core Power Utility", "Computer Primary User"], answer: 0 },
    { question: "Which sea animal is the largest fish?", options: ["Blue whale", "Whale shark", "Giant squid"], answer: 1 },
    { question: "Which port is commonly used by HTTPS?", options: ["21", "80", "443"], answer: 2 },
    { question: "Coral reefs are built mainly by what?", options: ["Animals", "Plants", "Rocks"], answer: 0 },
  ],
  [
    { question: "Which language is commonly used with React?", options: ["JavaScript", "SQL", "Bash"], answer: 0 },
    { question: "What helps fish breathe underwater?", options: ["Lungs", "Gills", "Fins"], answer: 1 },
    { question: "What does LAN mean?", options: ["Local Area Network", "Linked Access Node", "Long Analog Network"], answer: 0 },
    { question: "Which zone receives no sunlight?", options: ["Sunlight", "Twilight", "Midnight"], answer: 2 },
  ],
];

function getDailyTrivia(boss: BossKind): TriviaQuestion[] {
  const day = Math.floor(Date.now() / 86_400_000);
  const index = (day + BOSS_IDS.indexOf(boss)) % TRIVIA_SETS.length;
  return TRIVIA_SETS[index] ?? TRIVIA_SETS[0] ?? [];
}

function ProjectPeek({ index }: { index: number }) {
  const p = projects[index]!;
  return (
    <div>
      <div className="pixel-box-light bg-screen p-2">
        <img
          src={p.image}
          alt={`${p.name} preview`}
          width={640}
          height={512}
          loading="lazy"
          className="h-44 w-full object-cover sm:h-56"
        />
      </div>
      <h3 className="mt-4 font-display text-[0.6rem] text-accent">{p.name}</h3>
      <p className="mt-2">{p.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <li key={t} className="border-4 border-border bg-secondary px-2 py-1 text-base">
            {t}
          </li>
        ))}
      </ul>
      {p.placeholder && (
        <p className="mt-3 text-muted-foreground">
          ▪ Placeholder slot — real project details drop in here soon.
        </p>
      )}
    </div>
  );
}
