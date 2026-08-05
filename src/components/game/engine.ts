/** Tiny pixel platformer engine for the portfolio level. */

export const VIEW_W = 480;
export const VIEW_H = 270;
export const GROUND_Y = 214;
export const WORLD_W = 7900;

export type StationKind = "sign" | "cabinet" | "terminal" | "flag" | "portal" | "boss";

export type CharacterPalette = "coral" | "aqua" | "lime";
export type CharacterAccessory = "mask" | "cap" | "headset";
export type PetSpecies = "fish" | "turtle" | "octopus";
export type Appearance = {
  palette: CharacterPalette;
  accessory: CharacterAccessory;
  pet: PetSpecies;
  petColor: CharacterPalette;
};

export type Station = {
  id: string;
  kind: StationKind;
  x: number;
  label: string;
};

export type Coin = {
  id: string;
  x: number;
  y: number;
  taken: boolean;
  label: string;
};

export type Obstacle = {
  id: string;
  x: number;
  width: number;
  height: number;
  kind: "crate" | "spikes" | "mine" | "coral";
};

export type Zone = { name: string; from: number; to: number };

export const ZONES: Zone[] = [
  { name: "ABOUT ZONE", from: 0, to: 900 },
  { name: "SKILLS ZONE", from: 900, to: 2300 },
  { name: "WORK HISTORY ZONE", from: 2300, to: 3700 },
  { name: "DELIVERED SITES", from: 3700, to: 4800 },
  { name: "DIVE GATE", from: 4800, to: 5400 },
  { name: "DEEP ARCHIVE", from: 5400, to: 6200 },
  { name: "CURRENT RUN", from: 6200, to: 6750 },
  { name: "TOOL REEF", from: 6750, to: 7100 },
  { name: "KRAKEN TRENCH", from: 7100, to: 7500 },
  { name: "CONTACT CHAMBER", from: 7500, to: WORLD_W },
];

export function zoneAt(x: number): string {
  for (const z of ZONES) if (x >= z.from && x < z.to) return z.name;
  return ZONES[ZONES.length - 1]!.name;
}

export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  anim: number;
};

export type Input = { left: boolean; right: boolean; jump: boolean };

const PW = 14;
const PH = 22;
const GRAVITY = 900;
const SPEED = 130;
const JUMP_V = -330;

export function createPlayer(): Player {
  return { x: 60, y: GROUND_Y - PH, vx: 0, vy: 0, onGround: true, facing: 1, anim: 0 };
}

export function stepPlayer(p: Player, input: Input, dt: number) {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  p.vx = dir * SPEED;
  if (dir !== 0) p.facing = dir > 0 ? 1 : -1;
  if (input.jump && p.onGround) {
    p.vy = JUMP_V;
    p.onGround = false;
  }
  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.y + PH >= GROUND_Y) {
    p.y = GROUND_Y - PH;
    p.vy = 0;
    p.onGround = true;
  }
  p.x = Math.max(8, Math.min(WORLD_W - 40, p.x));
  p.anim += Math.abs(p.vx) * dt * 0.08;
}

export function playerCenter(p: Player) {
  return p.x + PW / 2;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

const SKY_BANDS: Array<[number, string]> = [
  [0, "#2b0a4a"],
  [0.16, "#4b0f6e"],
  [0.34, "#7d1090"],
  [0.5, "#b81c92"],
  [0.66, "#e0308a"],
  [0.78, "#f2596e"],
  [0.88, "#f98d55"],
];

function drawSky(ctx: CanvasRenderingContext2D) {
  const bandH = GROUND_Y / SKY_BANDS.length;
  SKY_BANDS.forEach(([, color], i) => {
    px(ctx, 0, i * bandH, VIEW_W, bandH + 1, color);
  });
  // Dither seam between bands.
  SKY_BANDS.forEach((_, i) => {
    if (i === 0) return;
    const y = i * bandH;
    for (let x = (i % 2) * 4; x < VIEW_W; x += 8) {
      px(ctx, x, y - 2, 4, 2, SKY_BANDS[i]![1]);
    }
  });
}

function drawSun(ctx: CanvasRenderingContext2D, camX: number) {
  const cx = 360 - camX * 0.05;
  const cy = 96;
  const r = 26;
  for (let y = -r; y < r; y += 2) {
    const w = Math.floor(Math.sqrt(r * r - y * y)) * 2;
    px(ctx, cx - w / 2, cy + y, w, 2, y > 6 ? "#ffd166" : "#ffe9a8");
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, camX: number) {
  const seeds = [40, 190, 330, 520, 700, 880, 1040];
  seeds.forEach((s, i) => {
    const x = ((s - camX * 0.15) % (VIEW_W + 260)) - 130 + (i % 2) * 20;
    const y = 26 + (i % 3) * 26;
    px(ctx, x, y, 46, 8, "#c46ce0");
    px(ctx, x + 10, y - 6, 26, 6, "#d98cf0");
    px(ctx, x + 4, y + 8, 40, 3, "#ffd9a0");
  });
}

function hills(
  ctx: CanvasRenderingContext2D,
  camX: number,
  parallax: number,
  baseY: number,
  amp: number,
  step: number,
  color: string,
  seed: number,
) {
  const off = camX * parallax;
  for (let x = 0; x < VIEW_W; x += step) {
    const wx = x + off;
    const h =
      amp * (0.5 + 0.5 * Math.sin(wx * 0.006 + seed)) +
      amp * 0.35 * Math.sin(wx * 0.017 + seed * 2);
    px(ctx, x, baseY - h, step, h + 40, color);
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y - 8, 22, 8, "#2fbf4c");
  px(ctx, x + 5, y - 13, 12, 6, "#48e06a");
  px(ctx, x + 2, y - 4, 18, 4, "#1c8f38");
}

function drawGround(ctx: CanvasRenderingContext2D, camX: number) {
  px(ctx, 0, GROUND_Y, VIEW_W, 6, "#ffe14d");
  px(ctx, 0, GROUND_Y + 6, VIEW_W, 10, "#8d2b2b");
  px(ctx, 0, GROUND_Y + 16, VIEW_W, VIEW_H - GROUND_Y - 16, "#5a1f3a");
  const off = Math.floor(camX) % 16;
  for (let x = -off; x < VIEW_W; x += 16) {
    px(ctx, x, GROUND_Y + 20, 6, 4, "#7a2b4d");
    px(ctx, x + 9, GROUND_Y + 30, 4, 4, "#7a2b4d");
    px(ctx, x + 3, GROUND_Y + 40, 5, 3, "#43142c");
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, camX: number) {
  if (camX >= 5200) {
    drawUnderwater(ctx, camX);
    return;
  }
  drawSky(ctx);
  drawSun(ctx, camX);
  drawClouds(ctx, camX);
  hills(ctx, camX, 0.25, GROUND_Y - 14, 54, 4, "#3d2ec9", 1.2);
  hills(ctx, camX, 0.45, GROUND_Y - 4, 32, 4, "#2a1f9e", 3.4);
  drawGround(ctx, camX);
  for (let i = 0; i < 40; i++) {
    const wx = i * 160 + 40;
    const sx = wx - camX;
    if (sx > -40 && sx < VIEW_W) drawBush(ctx, sx, GROUND_Y);
  }
}

function drawUnderwater(ctx: CanvasRenderingContext2D, camX: number) {
  px(ctx, 0, 0, VIEW_W, VIEW_H, "#087b9a");
  for (let i = 0; i < 8; i++) {
    px(ctx, 0, i * 28, VIEW_W, 29, i % 2 === 0 ? "#087b9a" : "#076f8a");
  }
  const rayOffset = Math.floor(camX * 0.08) % 120;
  for (let x = -rayOffset; x < VIEW_W + 80; x += 120) {
    for (let y = 0; y < 150; y += 8) px(ctx, x + y * 0.18, y, 18, 4, "rgba(105,232,221,0.12)");
  }
  hills(ctx, camX, 0.12, 190, 74, 6, "#07566f", 2.1);
  hills(ctx, camX, 0.3, 212, 42, 5, "#06465e", 5.2);
  px(ctx, 0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y, "#053d52");
  const ruins = Math.floor(camX / 180) * 180;
  for (let wx = ruins - 180; wx < camX + VIEW_W + 180; wx += 180) {
    const x = wx - camX;
    px(ctx, x, 166, 72, 48, "#07506a");
    for (let w = 0; w < 3; w++) px(ctx, x + 9 + w * 21, 178, 10, 18, "#04364c");
  }
  for (let i = 0; i < 22; i++) {
    const wx = i * 360 + 5480;
    const x = wx - camX;
    if (x > -20 && x < VIEW_W + 20) {
      px(ctx, x, 192, 4, 22, "#10a889");
      px(ctx, x + 5, 200, 3, 14, "#42d3a8");
    }
  }
  for (let i = 0; i < 18; i++) {
    const x = ((i * 137 - camX * 0.2) % (VIEW_W + 40)) - 20;
    const y = 22 + ((i * 47 + camX * 0.03) % 175);
    px(ctx, x, y, 2 + (i % 2), 2 + (i % 2), "#84f0df");
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  camX: number,
  appearance?: Appearance,
) {
  const x = p.x - camX;
  const y = p.y;
  const walking = Math.abs(p.vx) > 1 && p.onGround;
  const swing = walking ? (Math.floor(p.anim) % 2 === 0 ? 1 : -1) : 0;
  // shadow
  px(ctx, x - 1, GROUND_Y - 2, PW + 2, 2, "rgba(0,0,0,0.35)");
  // legs
  px(ctx, x + 2, y + 16, 4, 6, swing > 0 ? "#243a8f" : "#1b2c73");
  px(ctx, x + 8, y + 16, 4, 6, swing > 0 ? "#1b2c73" : "#243a8f");
  // body
  const suit = appearance?.palette === "coral" ? "#ff5f88" : appearance?.palette === "lime" ? "#66dc72" : "#25c2e0";
  px(ctx, x + 1, y + 8, PW - 2, 9, suit);
  px(ctx, x + 1, y + 12, PW - 2, 2, "#1a95ad");
  // arms
  px(ctx, p.facing > 0 ? x + PW - 2 : x, y + 9, 2, 6, "#f2c9a0");
  // head
  px(ctx, x + 2, y, 10, 9, "#f2c9a0");
  px(ctx, x + 1, y - 3, 12, 4, "#e0308a");
  px(ctx, p.facing > 0 ? x + 10 : x + 1, y - 2, 4, 2, "#b81c92");
  // eye
  px(ctx, p.facing > 0 ? x + 8 : x + 3, y + 3, 2, 2, "#20102a");
  if (appearance?.accessory === "mask") {
    px(ctx, x + 2, y + 1, 10, 5, "#65efff");
    px(ctx, x + 4, y + 3, 6, 2, "#12354a");
  } else if (appearance?.accessory === "headset") {
    px(ctx, x, y + 1, 2, 7, "#ffe14d");
    px(ctx, x + 12, y + 1, 2, 7, "#ffe14d");
  }
}

export function drawPet(
  ctx: CanvasRenderingContext2D,
  p: Player,
  camX: number,
  t: number,
  appearance: Appearance,
) {
  const x = p.x - camX - p.facing * 20;
  const y = p.y + 8 + Math.sin(t * 4) * 4;
  const color = appearance.petColor === "coral" ? "#ff7198" : appearance.petColor === "lime" ? "#7bea83" : "#5ee6ed";
  if (appearance.pet === "fish") {
    px(ctx, x, y, 10, 6, color);
    px(ctx, x - 4, y - 2, 4, 10, color);
  } else if (appearance.pet === "turtle") {
    px(ctx, x, y, 11, 7, color);
    px(ctx, x + 10, y + 2, 3, 3, "#baf3a4");
    px(ctx, x - 2, y - 2, 3, 3, "#baf3a4");
  } else {
    px(ctx, x, y, 9, 7, color);
    px(ctx, x, y + 7, 2, 5, color);
    px(ctx, x + 4, y + 7, 2, 5, color);
    px(ctx, x + 8, y + 7, 2, 5, color);
  }
}

export function drawCoin(ctx: CanvasRenderingContext2D, c: Coin, camX: number, t: number) {
  const x = c.x - camX;
  if (x < -20 || x > VIEW_W + 20) return;
  const bob = Math.round(Math.sin(t * 3 + c.x) * 3);
  const w = 4 + Math.round(Math.abs(Math.cos(t * 4 + c.x)) * 6);
  const y = c.y + bob;
  px(ctx, x + (10 - w) / 2, y, w, 10, "#ffd166");
  px(ctx, x + (10 - w) / 2 + 1, y + 2, Math.max(1, w - 4), 5, "#fff0b8");
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle, camX: number, t: number) {
  const x = obstacle.x - camX;
  if (x < -60 || x > VIEW_W + 60) return;
  const y = GROUND_Y - obstacle.height;
  if (obstacle.kind === "crate") {
    px(ctx, x, y, obstacle.width, obstacle.height, "#6b3a1f");
    px(ctx, x + 3, y + 3, obstacle.width - 6, obstacle.height - 6, "#b96835");
    px(ctx, x + 6, y + 6, obstacle.width - 12, 4, "#ffe14d");
  } else if (obstacle.kind === "spikes") {
    for (let i = 0; i < obstacle.width; i += 8) {
      px(ctx, x + i, GROUND_Y - 4, 8, 4, "#d9d2e6");
      px(ctx, x + i + 2, GROUND_Y - 8, 4, 4, "#f5e9ff");
    }
  } else if (obstacle.kind === "mine") {
    const bob = Math.round(Math.sin(t * 3 + obstacle.x) * 3);
    px(ctx, x + 4, y + bob, obstacle.width - 8, obstacle.height, "#132a3a");
    px(ctx, x, y + 5 + bob, obstacle.width, obstacle.height - 10, "#132a3a");
    px(ctx, x + obstacle.width / 2 - 2, y + obstacle.height / 2 - 2 + bob, 4, 4, "#ff5f88");
  } else {
    for (let i = 0; i < obstacle.width; i += 9) {
      px(ctx, x + i, GROUND_Y - 5, 5, 5, "#d83c88");
      px(ctx, x + i + 2, y + (i % 3) * 3, 4, obstacle.height - 5, "#ff7198");
    }
  }
}

export function drawCrevice(ctx: CanvasRenderingContext2D, camX: number) {
  const x = 5140 - camX;
  if (x < -80 || x > VIEW_W + 80) return;
  px(ctx, x, GROUND_Y - 3, 76, VIEW_H - GROUND_Y + 3, "#12051d");
  px(ctx, x - 5, GROUND_Y - 3, 8, 8, "#43142c");
  px(ctx, x + 70, GROUND_Y - 3, 8, 8, "#43142c");
}

export function drawMovingBoss(
  ctx: CanvasRenderingContext2D,
  boss: "fish" | "kraken",
  worldX: number,
  camX: number,
  t: number,
) {
  const drift = Math.sin(t * (boss === "fish" ? 1.8 : 1.15)) * (boss === "fish" ? 28 : 18);
  const bob = Math.sin(t * 2.4) * 7;
  const x = worldX - camX + drift;
  const y = GROUND_Y - 66 + bob;
  if (x < -100 || x > VIEW_W + 100) return;
  if (boss === "fish") {
    px(ctx, x, y, 58, 30, "#33d4cc");
    px(ctx, x - 15, y - 7, 16, 44, "#1fa7ae");
    px(ctx, x + 43, y + 8, 6, 6, "#ffe14d");
    px(ctx, x + 50, y + 9, 4, 3, "#08130e");
  } else {
    px(ctx, x, y - 8, 58, 38, "#d83c88");
    px(ctx, x + 12, y + 2, 5, 5, "#ffe14d");
    px(ctx, x + 39, y + 2, 5, 5, "#ffe14d");
    for (let i = 0; i < 5; i++) {
      const wave = Math.round(Math.sin(t * 3 + i) * 5);
      px(ctx, x + i * 12, y + 28, 6, 25 + wave, "#d83c88");
    }
  }
}

function drawSign(ctx: CanvasRenderingContext2D, x: number, label: string) {
  px(ctx, x + 10, GROUND_Y - 26, 4, 26, "#6b3a1f");
  px(ctx, x - 14, GROUND_Y - 52, 52, 28, "#2b1450");
  px(ctx, x - 12, GROUND_Y - 50, 48, 24, "#f5e9ff");
  ctx.fillStyle = "#3b1163";
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  const words = label.split(" ");
  words.slice(0, 3).forEach((w, i) => ctx.fillText(w, x + 12, GROUND_Y - 40 + i * 8));
  ctx.textAlign = "left";
}

function drawCabinet(ctx: CanvasRenderingContext2D, x: number, label: string, t: number) {
  px(ctx, x, GROUND_Y - 52, 34, 52, "#3a1266");
  px(ctx, x + 2, GROUND_Y - 50, 30, 48, "#7a24c4");
  px(ctx, x + 4, GROUND_Y - 46, 26, 20, "#0d0620");
  const flick = Math.sin(t * 6 + x) > 0 ? "#33e6ff" : "#22c3e0";
  px(ctx, x + 6, GROUND_Y - 44, 22, 16, flick);
  px(ctx, x + 8, GROUND_Y - 40, 8, 4, "#0d0620");
  px(ctx, x + 18, GROUND_Y - 34, 8, 4, "#0d0620");
  px(ctx, x + 5, GROUND_Y - 24, 24, 8, "#ff4fa3");
  px(ctx, x + 8, GROUND_Y - 22, 4, 4, "#ffe14d");
  px(ctx, x + 20, GROUND_Y - 22, 4, 4, "#33e6ff");
  ctx.fillStyle = "#ffe14d";
  ctx.font = "6px monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, x + 17, GROUND_Y - 8);
  ctx.textAlign = "left";
}

function drawTerminal(ctx: CanvasRenderingContext2D, x: number, t: number) {
  px(ctx, x, GROUND_Y - 8, 44, 8, "#3a1266");
  px(ctx, x + 4, GROUND_Y - 40, 36, 32, "#c9c2d6");
  px(ctx, x + 7, GROUND_Y - 37, 30, 22, "#08130e");
  const on = Math.sin(t * 4) > -0.4;
  px(ctx, x + 9, GROUND_Y - 35, 18, 2, "#4dff9e");
  px(ctx, x + 9, GROUND_Y - 31, 24, 2, "#4dff9e");
  if (on) px(ctx, x + 9, GROUND_Y - 27, 6, 2, "#4dff9e");
  px(ctx, x + 7, GROUND_Y - 13, 30, 4, "#8f88a3");
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, t: number) {
  px(ctx, x + 4, GROUND_Y - 64, 3, 64, "#d9d2e6");
  const wave = Math.round(Math.sin(t * 3) * 2);
  px(ctx, x + 7, GROUND_Y - 62 + wave, 30, 18, "#ffe14d");
  px(ctx, x + 7, GROUND_Y - 56 + wave, 30, 6, "#ff4fa3");
}

export function drawStation(
  ctx: CanvasRenderingContext2D,
  s: Station,
  camX: number,
  t: number,
  near: boolean,
) {
  const x = s.x - camX;
  if (x < -80 || x > VIEW_W + 80) return;
  if (s.kind === "sign") drawSign(ctx, x, s.label);
  if (s.kind === "cabinet") drawCabinet(ctx, x, s.label, t);
  if (s.kind === "terminal") drawTerminal(ctx, x, t);
  if (s.kind === "flag") drawFlag(ctx, x, t);
  if (s.kind === "portal") {
    px(ctx, x, GROUND_Y - 50, 38, 50, "#074e72");
    px(ctx, x + 5, GROUND_Y - 45, 28, 40, "#59e4e8");
    px(ctx, x + 10, GROUND_Y - 38, 18, 30, "#087b9a");
  }
  // Boss sprites are drawn separately so they can patrol and bob.
  if (near) {
    const bob = Math.round(Math.sin(t * 5) * 2);
    const bx = x + 6;
    const by = GROUND_Y - 74 + bob;
    px(ctx, bx, by, 22, 16, "#1b0a2e");
    px(ctx, bx + 2, by + 2, 18, 12, "#ffe14d");
    ctx.fillStyle = "#1b0a2e";
    ctx.font = "8px monospace";
    ctx.fillText("E", bx + 8, by + 11);
  }
}
