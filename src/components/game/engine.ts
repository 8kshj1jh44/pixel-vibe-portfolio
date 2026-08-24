/** Tiny pixel platformer engine for the portfolio level. */

export const VIEW_W = 480;
export const VIEW_H = 270;
export const GROUND_Y = 214;
export const WORLD_W = 7900;

/** Dive gate: stepping past this x-coordinate drops the player underwater. */
export const DIVE_GATE_X = 5140;
/** Left boundary of the underwater world; the player cannot walk back to land. */
export const UNDERWATER_MIN_X = 5440;
/** Entry spawn point when the splash sequence completes. */
export const UNDERWATER_SPAWN_X = UNDERWATER_MIN_X;
export const UNDERWATER_SPAWN_Y = GROUND_Y - 22;

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

/** Optional horizontal world boundaries applied by the physics tick. */
export type Bounds = { minX?: number; maxX?: number };

const PW = 14;
const PH = 22;
const GRAVITY = 900;
const SPEED = 130;
const JUMP_V = -330;
const SWIM_V = -165;
const SWIM_GRAVITY = 110;
const SWIM_MAX_UP = -150;
const SWIM_MAX_DOWN = 80;

export function createPlayer(): Player {
  return { x: 60, y: GROUND_Y - PH, vx: 0, vy: 0, onGround: true, facing: 1, anim: 0 };
}

export function stepPlayer(
  p: Player,
  input: Input,
  dt: number,
  solids: Obstacle[] = [],
  bounds: Bounds = {},
  underwater = false,
) {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  p.vx = dir * SPEED;
  if (dir !== 0) p.facing = dir > 0 ? 1 : -1;
  if (underwater) {
    // Buoyant swim: holding jump thrusts upward in the air, gravity is weak.
    if (input.jump) p.vy = SWIM_V;
    p.vy += SWIM_GRAVITY * dt;
    p.vy = Math.max(SWIM_MAX_UP, Math.min(SWIM_MAX_DOWN, p.vy));
  } else {
    if (input.jump && p.onGround) {
      p.vy = JUMP_V;
      p.onGround = false;
    }
    p.vy += GRAVITY * dt;
  }

  // Horizontal move + resolve.
  p.x += p.vx * dt;
  for (const o of solids) {
    const top = GROUND_Y - o.height;
    if (p.x + PW > o.x && p.x < o.x + o.width && p.y + PH > top + 2 && p.y < GROUND_Y) {
      p.x = p.vx > 0 ? o.x - PW : o.x + o.width;
      p.vx = 0;
    }
  }

  // Vertical move + resolve (landing on top of crates).
  const prevBottom = p.y + PH;
  p.y += p.vy * dt;
  p.onGround = false;
  for (const o of solids) {
    const top = GROUND_Y - o.height;
    if (p.x + PW > o.x && p.x < o.x + o.width) {
      if (p.vy >= 0 && prevBottom <= top + 1 && p.y + PH >= top) {
        p.y = top - PH;
        p.vy = 0;
        p.onGround = true;
      }
    }
  }

  // Ceiling: keep the player inside the top of the screen.
  if (p.y < 0) {
    p.y = 0;
    if (p.vy < 0) p.vy = 0;
  }

  if (p.y + PH >= GROUND_Y) {
    p.y = GROUND_Y - PH;
    p.vy = 0;
    p.onGround = true;
  }
  const minX = bounds.minX ?? 8;
  const maxX = bounds.maxX ?? WORLD_W - 40;
  p.x = Math.max(minX, Math.min(maxX, p.x));
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

function drawTree(ctx: CanvasRenderingContext2D, x: number) {
  px(ctx, x + 6, GROUND_Y - 26, 8, 26, "#5a3a1e");
  px(ctx, x + 5, GROUND_Y - 30, 10, 5, "#6b4526");
  px(ctx, x - 12, GROUND_Y - 38, 36, 14, "#1c8f38");
  px(ctx, x - 8, GROUND_Y - 48, 28, 12, "#2fbf4c");
  px(ctx, x - 4, GROUND_Y - 55, 20, 9, "#48e06a");
  px(ctx, x + 4, GROUND_Y - 60, 6, 5, "#7cef8f");
}

function drawGold(ctx: CanvasRenderingContext2D, x: number) {
  px(ctx, x + 1, GROUND_Y - 7, 6, 6, "#f2b01e");
  px(ctx, x + 7, GROUND_Y - 5, 5, 5, "#ffd166");
  px(ctx, x + 2, GROUND_Y - 9, 5, 3, "#ffd166");
  px(ctx, x + 4, GROUND_Y - 8, 2, 2, "#fff3ac");
}

function drawBuriedChest(ctx: CanvasRenderingContext2D, x: number) {
  px(ctx, x + 1, GROUND_Y - 8, 18, 5, "#a86a28");
  px(ctx, x + 7, GROUND_Y - 11, 8, 4, "#ffd166");
  px(ctx, x + 9, GROUND_Y - 13, 3, 3, "#ffe14d");
  px(ctx, x + 3, GROUND_Y - 5, 14, 5, "#c98a35");
}

function drawDinoSkull(ctx: CanvasRenderingContext2D, x: number) {
  px(ctx, x + 1, GROUND_Y - 8, 20, 7, "#e6e0c8");
  px(ctx, x + 4, GROUND_Y - 10, 14, 3, "#e6e0c8");
  px(ctx, x + 5, GROUND_Y - 6, 4, 4, "#1b0a2e");
  px(ctx, x + 14, GROUND_Y - 6, 4, 4, "#1b0a2e");
  for (let i = 0; i < 3; i++) px(ctx, x + 8 + i * 4, GROUND_Y - 2, 3, 6, "#d8d2ba");
}

function drawHumanSkeleton(ctx: CanvasRenderingContext2D, x: number) {
  px(ctx, x + 2, GROUND_Y - 7, 11, 5, "#d8d2ba");
  px(ctx, x + 5, GROUND_Y - 5, 4, 3, "#1b0a2e");
  px(ctx, x + 9, GROUND_Y - 11, 3, 5, "#d8d2ba");
  px(ctx, x + 6, GROUND_Y - 2, 2, 6, "#d8d2ba");
}

function drawLandTreasures(ctx: CanvasRenderingContext2D, camX: number) {
  for (let i = 0; i < 24; i++) {
    const wx = i * 280 + 160 + (i % 3) * 40;
    const x = wx - camX;
    if (x < -70 || x > VIEW_W + 70) continue;
    const type = i % 4;
    if (type === 0) drawGold(ctx, x);
    else if (type === 1) drawBuriedChest(ctx, x);
    else if (type === 2) drawDinoSkull(ctx, x);
    else drawHumanSkeleton(ctx, x);
  }
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

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  camX: number,
  forceUnderwater = false,
  t = 0,
) {
  if (camX >= 5200 || forceUnderwater) {
    drawUnderwater(ctx, camX, t);
    return;
  }
  drawSky(ctx);
  drawSun(ctx, camX);
  drawClouds(ctx, camX);
  hills(ctx, camX, 0.25, GROUND_Y - 14, 54, 4, "#3d2ec9", 1.2);
  hills(ctx, camX, 0.45, GROUND_Y - 4, 32, 4, "#2a1f9e", 3.4);
  drawLandTreasures(ctx, camX);
  drawGround(ctx, camX);
  for (let i = 0; i < 40; i++) {
    const wx = i * 160 + 40;
    const sx = wx - camX;
    if (sx > -40 && sx < VIEW_W) drawBush(ctx, sx, GROUND_Y);
  }
  for (let i = 0; i < 22; i++) {
    const wx = i * 280 + 90;
    const sx = wx - camX;
    if (sx > -70 && sx < VIEW_W + 70) drawTree(ctx, sx);
  }
}

function drawUnderwater(ctx: CanvasRenderingContext2D, camX: number, t: number) {
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

  // Tall kelp / grass swaying from the sea floor.
  for (let i = 0; i < 26; i++) {
    const wx = i * 190 + 5560 + (i % 3) * 40;
    const x = wx - camX;
    if (x > -30 && x < VIEW_W + 30) {
      const h = 34 + (i % 4) * 12;
      const sway = Math.sin(t * 2 + i) * 3;
      for (let s = 0; s < 4; s++) {
        px(
          ctx,
          x + s * 3 + sway * (s / 4),
          GROUND_Y - h + s * 9,
          2,
          h - s * 9,
          s % 2 ? "#1f7a4a" : "#2f9c5e",
        );
      }
    }
  }
  // Clumps of moss along the floor.
  for (let i = 0; i < 20; i++) {
    const wx = i * 260 + 5500;
    const x = wx - camX;
    if (x > -20 && x < VIEW_W + 20) {
      px(ctx, x, GROUND_Y - 5, 16, 5, "#1f7a4a");
      px(ctx, x + 3, GROUND_Y - 8, 8, 3, "#2f9c5e");
      px(ctx, x + 6, GROUND_Y - 11, 5, 3, "#3fbf74");
    }
  }
  // Dramatic sunken ships resting on the floor.
  for (let i = 0; i < 5; i++) {
    const wx = i * 440 + 5680;
    const x = wx - camX;
    if (x > -100 || x > VIEW_W + 100) continue;
    const tilt = i % 2 === 0 ? 1 : -1;
    // Hull resting on the floor.
    px(ctx, x, GROUND_Y - 22, 72, 12, "#4a2f14");
    px(ctx, x + 2, GROUND_Y - 26, 66, 6, "#6b4526");
    px(ctx, x + 4, GROUND_Y - 24, 62, 4, "#8a5a2c");
    // Splintered broken stern that leans with the tilt.
    px(ctx, x + 2 + tilt * 4, GROUND_Y - 38, 14, 8, "#5a3a1e");
    px(ctx, x + 6 + tilt * 6, GROUND_Y - 44, 10, 6, "#6b4526");
    px(ctx, x + 10 + tilt * 8, GROUND_Y - 48, 6, 4, "#7a5230");
    // Snapped mast leaning over.
    px(ctx, x + 40 + tilt * 8, GROUND_Y - 52, 4, 30, "#8a6a40");
    px(ctx, x + 30 + tilt * 10, GROUND_Y - 56, 20, 4, "#7a5230");
    px(ctx, x + 36 + tilt * 12, GROUND_Y - 62, 10, 6, "#5a3a1e");
    // Cracks in the hull.
    px(ctx, x + 14, GROUND_Y - 24, 2, 8, "#24130a");
    px(ctx, x + 30, GROUND_Y - 25, 2, 10, "#24130a");
    px(ctx, x + 48, GROUND_Y - 23, 2, 7, "#24130a");
    px(ctx, x + 22, GROUND_Y - 24, 3, 4, "#1a0d06");
    px(ctx, x + 42, GROUND_Y - 25, 3, 4, "#1a0d06");
    // Jagged broken holes / splintered planks.
    px(ctx, x + 18, GROUND_Y - 22, 6, 4, "#170b04");
    px(ctx, x + 52, GROUND_Y - 21, 7, 5, "#170b04");
    px(ctx, x + 20, GROUND_Y - 19, 3, 3, "#0f0803");
    px(ctx, x + 55, GROUND_Y - 18, 3, 3, "#0f0803");
    // Scattered broken planks on the sea floor.
    px(ctx, x + 8, GROUND_Y - 6, 10, 3, "#6b4526");
    px(ctx, x + 58, GROUND_Y - 5, 12, 3, "#5a3a1e");
    px(ctx, x + 62, GROUND_Y - 9, 8, 3, "#6b4526");
    // Barnacle / rust streaks for a decayed look.
    px(ctx, x + 8, GROUND_Y - 27, 3, 3, "#3a8f6a");
    px(ctx, x + 60, GROUND_Y - 27, 3, 3, "#3a8f6a");
    px(ctx, x + 26, GROUND_Y - 26, 2, 2, "#2f7a5a");
    px(ctx, x + 52, GROUND_Y - 24, 2, 2, "#2f7a5a");
  }
  // Treasure chests, some open with a glowing coin pile.
  for (let i = 0; i < 6; i++) {
    const wx = i * 320 + 5600 + (i % 2) * 120;
    const x = wx - camX;
    if (x > -30 && x < VIEW_W + 30) {
      const open = i % 2 === 0;
      px(ctx, x, GROUND_Y - 12, 20, 12, "#8a5a20");
      px(ctx, x + 3, GROUND_Y - 9, 14, 6, "#c98a35");
      px(ctx, x + 8, GROUND_Y - 4, 4, 4, "#ffe14d");
      if (open) {
        px(ctx, x, GROUND_Y - 18, 20, 6, "#a86a28");
        px(ctx, x + 2, GROUND_Y - 15, 3, 3, "#ffd166");
        px(ctx, x + 10, GROUND_Y - 20, 6, 6, "#ffd166");
        px(ctx, x + 12, GROUND_Y - 14, 3, 3, "#fff3ac");
      }
    }
  }

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
  drawFishSchool(ctx, t);
}

/** A school of small background fish; some dart away when "startled". */
function drawFishSchool(ctx: CanvasRenderingContext2D, t: number) {
  for (let i = 0; i < 9; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = 14 + (i % 3) * 7;
    const baseY = 30 + (i % 5) * 27;
    const span = VIEW_W + 80;
    const travel = (((t * speed + i * 89) % span) + span) % span;
    const x = travel - 40;
    if (x < -50 || x > VIEW_W + 50) continue;
    const y = baseY + Math.sin(t * 2 + i) * 3;
    // Occasionally a fish is startled and lunges away from the school.
    const st = Math.sin(t * 1.25 + i * 1.6);
    const startled = st > 0.86;
    const dart = startled ? Math.sin(t * 9 + i) * 30 : 0;
    const dx = x + dart * dir;
    const body = i % 3 === 0 ? "#37c8d6" : "#2e9bd6";
    px(ctx, dx, y, 10, 4, body);
    px(ctx, dx, y + 1, 10, 2, "rgba(255,255,255,0.25)");
    px(ctx, dir > 0 ? dx + 8 : dx - 6, y + 1, 4, 2, "#1f7fb0");
    px(ctx, dir > 0 ? dx + 10 : dx - 8, y + 2, 2, 1, "#1f7fb0");
    px(ctx, dir > 0 ? dx + 8 : dx, y, 1, 1, "#0f3a52");
    if (startled) px(ctx, dx - 2, y - 3, 3, 3, "#bfeef7");
  }
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Player,
  camX: number,
  appearance?: Appearance,
  underwater = false,
) {
  const x = p.x - camX;
  const y = p.y;
  const walking = Math.abs(p.vx) > 1 && p.onGround;
  const swimming = underwater && !p.onGround;
  const swing = walking ? (Math.floor(p.anim) % 2 === 0 ? 1 : -1) : 0;
  const flap = swimming ? (Math.floor(p.anim * 1.5) % 2 === 0 ? 1 : -1) : 0;
  // shadow
  if (!underwater) px(ctx, x - 1, GROUND_Y - 2, PW + 2, 2, "rgba(0,0,0,0.35)");
  // legs (or fins when swimming)
  if (underwater) {
    px(ctx, x + 2, y + 16, 4, 6 + flap * 2, "#1b2c73");
    px(ctx, x + 8, y + 16, 4, 6 - flap * 2, "#1b2c73");
  } else {
    px(ctx, x + 2, y + 16, 4, 6, swing > 0 ? "#243a8f" : "#1b2c73");
    px(ctx, x + 8, y + 16, 4, 6, swing > 0 ? "#1b2c73" : "#243a8f");
  }
  // body: wet-suit with tank when underwater
  if (underwater) {
    px(ctx, p.facing > 0 ? x + PW : x - 4, y + 8, 4, 9, "#5b6b8f");
    px(ctx, x + 1, y + 8, PW - 2, 9, "#1d2c6e");
    px(ctx, x + 1, y + 12, PW - 2, 2, "#0f1a45");
  } else {
    const suit =
      appearance?.palette === "coral"
        ? "#ff5f88"
        : appearance?.palette === "lime"
          ? "#66dc72"
          : "#25c2e0";
    px(ctx, x + 1, y + 8, PW - 2, 9, suit);
    px(ctx, x + 1, y + 12, PW - 2, 2, "#1a95ad");
  }
  // arms
  px(ctx, p.facing > 0 ? x + PW - 2 : x, y + 9, 2, 6, "#f2c9a0");
  // head: scuba mask when underwater
  px(ctx, x + 2, y, 10, 9, "#f2c9a0");
  if (underwater) {
    px(ctx, x + 1, y - 2, 12, 3, "#1d2c6e");
    px(ctx, x + 2, y + 2, 10, 5, "#9fd8e8");
    px(ctx, x + 3, y + 3, 8, 3, "#12354a");
    px(ctx, p.facing > 0 ? x + 13 : x - 3, y + 3, 2, 4, "#65efff");
  } else {
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
  const color =
    appearance.petColor === "coral"
      ? "#ff7198"
      : appearance.petColor === "lime"
        ? "#7bea83"
        : "#5ee6ed";
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

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  camX: number,
  t: number,
) {
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
    // TNT floats in the water column with a gentle bob.
    const fy = GROUND_Y - 118 + Math.sin(t * 2 + obstacle.x) * 6;
    px(ctx, x + 4, fy, obstacle.width - 8, obstacle.height, "#132a3a");
    px(ctx, x, fy + 5, obstacle.width, obstacle.height - 10, "#132a3a");
    px(ctx, x + obstacle.width / 2 - 2, fy + obstacle.height / 2 - 2, 4, 4, "#ff5f88");
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

export type BossKind = "fish" | "kraken" | "golem" | "angler" | "goblin";

/** On-screen anchor point (already camera-offset) for a boss sprite. */
export function bossScreenPos(
  boss: BossKind,
  worldX: number,
  camX: number,
  t: number,
): { x: number; y: number; w: number } {
  const speed =
    boss === "fish"
      ? 1.8
      : boss === "angler"
        ? 1.4
        : boss === "golem"
          ? 0.9
          : boss === "goblin"
            ? 0.7
            : 1.15;
  const range =
    boss === "fish"
      ? 28
      : boss === "angler"
        ? 34
        : boss === "golem"
          ? 22
          : boss === "goblin"
            ? 26
            : 18;
  const width = boss === "fish" || boss === "kraken" ? 58 : boss === "golem" ? 46 : 50;
  const drift = Math.sin(t * speed) * range;
  const bob = Math.sin(t * 2.4) * 7;
  const x = worldX - camX + drift;
  let y = GROUND_Y - 96 + bob;
  if (boss === "golem") y = GROUND_Y - 70 + Math.sin(t * 3) * 2;
  else if (boss === "goblin") y = GROUND_Y - 88 + Math.sin(t * 2.6) * 2;
  return { x, y, w: width };
}

export function drawMovingBoss(
  ctx: CanvasRenderingContext2D,
  boss: BossKind,
  worldX: number,
  camX: number,
  t: number,
  playerX: number,
) {
  const { x, y } = bossScreenPos(boss, worldX, camX, t);
  if (x < -100 || x > VIEW_W + 100) return;
  // Swimming bosses turn to face the player; land bosses keep their pose.
  const swim = boss === "fish" || boss === "angler" || boss === "kraken";
  const faceRight = !swim || playerX >= worldX;
  if (swim && !faceRight) {
    const w = boss === "fish" || boss === "kraken" ? 58 : 50;
    const cx = x + w / 2;
    ctx.save();
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }
  if (boss === "fish") {
    const hs = Math.round(Math.sin(t * 2.8) * 4);
    px(ctx, x, y, 58, 30, "#33d4cc");
    px(ctx, x - 15, y - 7, 16, 44, "#1fa7ae");
    px(ctx, x + 43 + hs, y + 8, 6, 6, "#ffe14d");
    px(ctx, x + 50 + hs, y + 9, 4, 3, "#08130e");
  } else if (boss === "golem") {
    px(ctx, x, y, 46, 46, "#5a3fb0");
    px(ctx, x + 4, y + 4, 38, 20, "#8a6cf0");
    px(ctx, x + 10, y + 10, 8, 6, "#ffe14d");
    px(ctx, x + 28, y + 10, 8, 6, "#ffe14d");
    px(ctx, x + 6, y + 30, 34, 8, "#33e6ff");
    px(ctx, x - 8, y + 12, 8, 20, "#5a3fb0");
    px(ctx, x + 46, y + 12, 8, 20, "#5a3fb0");
  } else if (boss === "goblin") {
    px(ctx, x - 9, y + 8, 7, 16, "#2c8a42");
    px(ctx, x + 50, y + 8, 7, 16, "#2c8a42");
    px(ctx, x, y, 50, 52, "#3aa654");
    px(ctx, x + 4, y + 4, 42, 24, "#55c96f");
    px(ctx, x + 10, y + 10, 9, 9, "#ffe14d");
    px(ctx, x + 31, y + 10, 9, 9, "#ffe14d");
    px(ctx, x + 13, y + 12, 4, 4, "#1b0a2e");
    px(ctx, x + 34, y + 12, 4, 4, "#1b0a2e");
    px(ctx, x + 18, y + 24, 14, 6, "#1f6b30");
    px(ctx, x + 11, y + 34, 28, 9, "#9ff0ae");
    px(ctx, x + 15, y + 34, 4, 10, "#ffffff");
    px(ctx, x + 31, y + 34, 4, 10, "#ffffff");
    px(ctx, x - 7, y + 22, 9, 20, "#2c8a42");
    px(ctx, x + 48, y + 22, 9, 20, "#2c8a42");
  } else if (boss === "angler") {
    const hs = Math.round(Math.sin(t * 2.8) * 5);
    px(ctx, x, y, 50, 34, "#2b2f6e");
    px(ctx, x - 12, y + 4, 12, 26, "#1c2050");
    px(ctx, x + 12 + hs, y - 16, 3, 16, "#8ad8ff");
    const glow = Math.sin(t * 5) > 0 ? "#ffe14d" : "#fff3ac";
    px(ctx, x + 8 + hs, y - 22, 10, 8, glow);
    px(ctx, x + 34 + hs, y + 8, 6, 6, "#ff5f88");
    for (let i = 0; i < 6; i++) px(ctx, x + 6 + i * 8, y + 28, 4, 6, "#f5e9ff");
  } else {
    const hs = Math.round(Math.sin(t * 2.8) * 4);
    px(ctx, x, y - 8, 58, 38, "#d83c88");
    px(ctx, x + 12 + hs, y + 2, 5, 5, "#ffe14d");
    px(ctx, x + 39 + hs, y + 2, 5, 5, "#ffe14d");
    for (let i = 0; i < 5; i++) {
      const wave = Math.round(Math.sin(t * 3 + i) * 5);
      px(ctx, x + i * 12, y + 28, 6, 25 + wave, "#d83c88");
    }
  }
  if (swim && !faceRight) ctx.restore();
}

export function drawExplosion(ctx: CanvasRenderingContext2D, x: number, y: number, dt: number) {
  const alive = 1 - dt;
  if (alive <= 0) return;
  const r = Math.max(2, Math.floor(30 * alive));
  px(
    ctx,
    x - r,
    y - r,
    r * 2,
    r * 2,
    alive > 0.7 ? "#ffffff" : alive > 0.4 ? "#ffe14d" : "#ff7a1a",
  );
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2;
    const dist = Math.floor(22 * alive) + (i % 3) * 6;
    const px2 = x + Math.cos(ang) * dist;
    const py = y + Math.sin(ang) * dist;
    px(ctx, px2, py, 4, 4, i % 2 ? "#ffd166" : "#ff5f88");
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

const FLAG_URL = "/Flag_of_the_Philippines.png";
let flagImg: HTMLImageElement | null = null;
let flagImgReady = false;

function getFlagImage(): HTMLImageElement | null {
  if (!flagImg) {
    flagImg = new Image();
    flagImg.src = FLAG_URL;
    flagImg.onload = () => {
      flagImgReady = true;
    };
  }
  return flagImg;
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, t: number) {
  px(ctx, x + 4, GROUND_Y - 64, 3, 64, "#d9d2e6");
  const wave = Math.round(Math.sin(t * 3) * 2);
  const fx = x + 7;
  const fy = GROUND_Y - 62 + wave;
  const img = getFlagImage();
  if (flagImgReady && img) {
    ctx.drawImage(img, fx, fy, 72, 36);
  } else {
    // Simple fallback while the flag image loads.
    px(ctx, fx, fy, 30, 9, "#0038A8");
    px(ctx, fx, fy + 9, 30, 9, "#CE1126");
    for (let i = 0; i < 15; i++) {
      px(ctx, fx + i, fy + (15 - (i + 1)) / 2, 1, i + 1, "#FFFFFF");
    }
  }
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
    let bx: number;
    let by: number;
    if (s.kind === "boss") {
      // Ride on the moving boss, centered and just above the top of its head.
      const bp = bossScreenPos(s.id as BossKind, s.x, camX, t);
      bx = bp.x + Math.round((bp.w - 22) / 2);
      by = bp.y - 16;
    } else {
      // Centered on the object and sitting exactly on top of it.
      const box = stationPromptBox(s.kind);
      bx = x + box.cx - 11;
      by = GROUND_Y - box.top - 16 + bob;
    }
    px(ctx, bx, by, 22, 16, "#1b0a2e");
    px(ctx, bx + 2, by + 2, 18, 12, "#ffe14d");
    ctx.fillStyle = "#1b0a2e";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("E", bx + 11, by + 11);
    ctx.textAlign = "left";
  }
}

/** Center offset (from the station x) and height above ground of each object. */
function stationPromptBox(kind: StationKind): { cx: number; top: number } {
  switch (kind) {
    case "sign":
      return { cx: 12, top: 52 };
    case "cabinet":
      return { cx: 17, top: 52 };
    case "terminal":
      return { cx: 22, top: 40 };
    case "flag":
      return { cx: 21, top: 62 };
    case "portal":
      return { cx: 19, top: 50 };
    default:
      return { cx: 17, top: 52 };
  }
}
