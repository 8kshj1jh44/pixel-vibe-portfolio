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
  zoneAt,
  type Coin,
  type Station,
  type Appearance,
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

type Screen = "title" | "rules" | "customize" | "playing";
type Dialog =
  | { type: "about" }
  | { type: "skills" }
  | { type: "job"; index: number }
  | { type: "project"; index: number }
  | { type: "education" }
  | { type: "certifications" }
  | { type: "tools" }
  | { type: "challenge"; boss: "fish" | "kraken"; step: "intro" | "active" | "success" }
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
  { id: "dive", kind: "portal", x: 5180, label: "DIVE" },
  { id: "education", kind: "sign", x: 5580, label: "EDUCATION" },
  { id: "certifications", kind: "sign", x: 5900, label: "CERTS" },
  { id: "fish", kind: "boss", x: 6400, label: "BIG FISH" },
  { id: "tools", kind: "sign", x: 6860, label: "TOOLS" },
  { id: "kraken", kind: "boss", x: 7240, label: "KRAKEN" },
  { id: "contact", kind: "terminal", x: 7600, label: "CONTACT" },
  { id: "end", kind: "flag", x: 7800, label: "GOAL" },
];

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
  const [completedBosses, setCompletedBosses] = useState<Array<"fish" | "kraken">>([]);
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
    else if (s.id === "fish" || s.id === "kraken") {
      if (completedBosses.includes(s.id)) setDialog({ type: "challenge", boss: s.id, step: "success" });
      else setDialog({ type: "challenge", boss: s.id, step: "intro" });
    }
    else if (s.id.startsWith("job-")) setDialog({ type: "job", index: Number(s.id.slice(4)) });
    else if (s.id.startsWith("project-"))
      setDialog({ type: "project", index: Number(s.id.slice(8)) });
  }, [completedBosses]);

  const advanceChallenge = useCallback((boss: "fish" | "kraken") => {
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

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!pausedRef.current) {
        elapsed += dt;
        stepPlayer(player, inputRef.current, dt);

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

      drawBackground(ctx, camX);
      for (const s of STATIONS) drawStation(ctx, s, camX, elapsed, nearRef.current?.id === s.id);
      for (const c of coins) if (!c.taken) drawCoin(ctx, c, camX, elapsed);
      drawPet(ctx, player, camX, elapsed, appearance);
      drawPlayer(ctx, player, camX, appearance);

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
          <div className="border-4 border-border bg-screen/85 px-2 py-1">
            <p className="font-display text-[0.45rem] text-cyan-crt sm:text-[0.55rem]">
              SKILLS {collected.length}/{skills.length}
            </p>
          </div>
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
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-screen/70 px-4 text-center">
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
          </div>
          <p className="blink mt-6 font-display text-[0.5rem] text-foreground">PRESS START</p>
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
          onStart={() => {
            setChallengeProgress(0);
            setDialog({ type: "challenge", boss: dialog.boss, step: "active" });
          }}
          onAdvance={() => advanceChallenge(dialog.boss)}
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
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-screen/90 p-3">
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
  onStart,
  onAdvance,
  onClose,
}: {
  boss: "fish" | "kraken";
  step: "intro" | "active" | "success";
  progress: number;
  onStart: () => void;
  onAdvance: () => void;
  onClose: () => void;
}) {
  const fish = boss === "fish";
  const labels = fish ? ["TOP", "LOW", "TOP", "LOW"] : ["CYAN", "CORAL", "LIME", "CYAN"];
  return (
    <PixelDialog
      title={fish ? "BIG FISH — CURRENT RUN" : "KRAKEN — SIGNAL SEQUENCE"}
      onClose={onClose}
      footer={step === "intro" ? <button type="button" className="pixel-btn bg-primary text-primary-foreground" onClick={onStart}>START CHALLENGE</button> : undefined}
    >
      {step === "intro" && <p>{fish ? "Read the charge pattern and clear four safe lanes." : "Activate four signal terminals in the displayed order."} This short challenge never resets your portfolio progress.</p>}
      {step === "active" && (
        <div className="text-center">
          <p className="font-display text-[0.55rem] text-cyan-crt">STEP {progress + 1} / 4</p>
          <div className="my-5 border-4 border-accent bg-screen p-5">
            <span className="font-display text-base text-accent">{labels[progress]}</span>
          </div>
          <button type="button" className="pixel-btn bg-primary text-primary-foreground" onClick={onAdvance}>
            {fish ? "DODGE NOW" : "ACTIVATE"}
          </button>
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
