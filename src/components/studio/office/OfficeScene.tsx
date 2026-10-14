'use client';

import { useEffect, useRef } from 'react';
import {
  Application,
  Assets,
  ColorMatrixFilter,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Text,
  Texture,
  type TextStyleOptions,
} from 'pixi.js';
import { AGENTS, BOARD_COLUMNS, type StudioAgent } from '@/lib/studio/agents';
import type { AgentMood, AgentState } from '@/lib/studio/pipeline';
import type { StudioAgentId } from '@/lib/studio/types';
import {
  OFFICE_CALIBRATION as CAL,
  PLATE_FRONT,
  PLATE_ROOM,
  type Pt,
} from '@/lib/studio/office-calibration';
import { OFFICE_SPRITES, type SpriteClip } from '@/lib/studio/office-sprites';

export type OfficeTarget = { type: 'agent'; id: StudioAgentId } | { type: 'board' } | { type: 'ceo' };

/** A sticky note on the wall board. */
export interface BoardCard {
  id: string;
  title: string;
  /** 0xRRGGBB */
  color: number;
}

export interface OfficeSceneProps {
  states: Record<StudioAgentId, AgentState>;
  /** Cards per BOARD_COLUMNS index. */
  boardCards: BoardCard[][];
  inboxCount: number;
  selected: OfficeTarget | null;
  onSelect: (t: OfficeTarget | null) => void;
}

/* ---------------- design space = rendered plate pixels ---------------- */

/** pixels per metre, vertical (from Blender calibration) */
const PX_M = CAL.unit.origin[1] - CAL.unit.up[1];
const U0 = CAL.unit.origin;
const COLV: Pt = [CAL.unit.col[0] - U0[0], CAL.unit.col[1] - U0[1]];
const ROWV: Pt = [CAL.unit.row[0] - U0[0], CAL.unit.row[1] - U0[1]];

/** floor units (col, row) -> plate pixels */
function toPx(col: number, row: number): Pt {
  return [U0[0] + col * COLV[0] + row * ROWV[0], U0[1] + col * COLV[1] + row * ROWV[1]];
}
/** plate pixels -> floor units */
function toUnit(x: number, y: number): Pt {
  const det = COLV[0] * ROWV[1] - ROWV[0] * COLV[1];
  const dx = x - U0[0];
  const dy = y - U0[1];
  return [(dx * ROWV[1] - ROWV[0] * dy) / det, (COLV[0] * dy - dx * COLV[1]) / det];
}

/* ---------------- character sprite sheets ---------------- */

/** true-iso elevation: a vertical metre on screen = cos(35.264°) camera-plane metres */
const ISO_COS = Math.cos((35.264 * Math.PI) / 180);
/**
 * Match a sprite-sheet metre to a plate metre, then shrink ~14% so the cast
 * sits in the stylised furniture instead of swallowing the chairs.
 */
const SPRITE_SCALE = (PX_M / ISO_COS / OFFICE_SPRITES.pxPerM) * 0.86;

interface ClipTextures {
  clip: SpriteClip;
  frames: Texture[];
}
type CharTextures = Record<string, ClipTextures>;

async function loadCharacterSheets(ids: string[]): Promise<Record<string, CharTextures>> {
  const out: Record<string, CharTextures> = {};
  await Promise.all(
    ids.map(async (id) => {
      const clips = OFFICE_SPRITES.chars[id];
      if (!clips) return;
      const char: CharTextures = {};
      await Promise.all(
        Object.entries(clips).map(async ([name, clip]) => {
          try {
            const sheet = (await Assets.load(clip.src)) as Texture;
            const frames: Texture[] = [];
            for (let k = 0; k < clip.frames; k++) {
              const x = (k % clip.cols) * clip.fw;
              const y = Math.floor(k / clip.cols) * clip.fh;
              frames.push(new Texture({ source: sheet.source, frame: new Rectangle(x, y, clip.fw, clip.fh) }));
            }
            char[name] = { clip, frames };
          } catch (err) {
            console.warn('[office] sprite sheet failed', clip.src, err);
          }
        }),
      );
      if (Object.keys(char).length) out[id] = char;
    }),
  );
  return out;
}

const LABEL: TextStyleOptions = {
  fontFamily: 'Staatliches, system-ui, sans-serif',
  fontSize: 26,
  letterSpacing: 2,
  fill: 0xf4f0f8,
  dropShadow: { alpha: 0.6, blur: 6, distance: 2, color: 0x000000 },
};
const SMALL: TextStyleOptions = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 17,
  fill: 0xe6ddf0,
  dropShadow: { alpha: 0.6, blur: 4, distance: 1, color: 0x000000 },
};
const INK: TextStyleOptions = {
  fontFamily: 'Staatliches, system-ui, sans-serif',
  fontSize: 15,
  letterSpacing: 1,
  fill: 0x2a2233,
};

/* per-agent look (procedural fallback if a sprite sheet fails to load) */
const LOOKS: Record<StudioAgentId, { skin: number; hair: number; hairStyle: 'short' | 'bun' | 'curly' | 'long' }> = {
  lead: { skin: 0xe9b58f, hair: 0x2a1a1a, hairStyle: 'bun' },
  librarian: { skin: 0xf3cfae, hair: 0x6b3b1e, hairStyle: 'short' },
  designer: { skin: 0xd9a176, hair: 0x14100f, hairStyle: 'long' },
  ui_engineer: { skin: 0xc48a63, hair: 0x1c1412, hairStyle: 'curly' },
  tokens: { skin: 0xf0c9a6, hair: 0x101010, hairStyle: 'short' },
  engineer: { skin: 0xb77a55, hair: 0x1a0f0f, hairStyle: 'long' },
  qa: { skin: 0xf6d6b5, hair: 0xc98a3a, hairStyle: 'curly' },
};

function darken(color: number, f: number) {
  const r = Math.round(((color >> 16) & 255) * f);
  const g = Math.round(((color >> 8) & 255) * f);
  const b = Math.round((color & 255) * f);
  return (r << 16) | (g << 8) | b;
}

/* ---------------- floor plan (units = metres, from the Blender scene) ----------------
 *
 *  back wall (row 0)
 *  row 1 desks: cols 2.95 / 5.65 / 8.35 / 11.05, desk row 2.05, chairs row 1.15
 *  lane 1 (row 3.3)
 *  row 2 desks: cols 3.95 / 6.65 / 9.35, desk row 5.05, chairs row 4.15
 *  lane 2 (row 6.2)
 *  sofa (0.75, 7.4)      CEO desk (6.9, 8.85), CEO chair (6.9, 9.75)      coffee cart (11.9, 7.9)
 */
const LANE_ROW: Record<1 | 2, number> = { 1: 3.3, 2: 6.2 };
/** gaps between row-2 desks (and the open floor either side) — the only ways between the lanes */
const ROW2_GAPS = [2.0, 5.3, 8.0, 11.0];
const WALK_SPEED = 1.35; // units / s

/** Somewhere a person can stand/sit; `steps` walks from the lane point to the spot. */
interface Spot {
  lane: 1 | 2;
  laneCol: number;
  steps: Pt[];
  /** what to look at when arrived */
  lookAt: Pt;
}

interface SeatPlan {
  unit: Pt;
  row: 1 | 2;
  gap: number;
  spot: Spot;
  /** where a colleague stands to chat */
  visitor: Spot;
}

function seatPlan(agentId: StudioAgentId, unitHint?: Pt, feet?: Pt): SeatPlan {
  const unit = unitHint ?? (feet ? toUnit(feet[0], feet[1]) : [6, 1.15]);
  const [cx, srow] = unit;
  const row: 1 | 2 = srow < 3 ? 1 : 2;
  // gap between desks; last desk on the right uses the gap on its left
  let gap = cx + 1.35;
  if (gap > 12.0) gap = cx - 1.35;
  if (agentId === 'qa') gap = cx - 1.35;
  return {
    unit,
    row,
    gap,
    spot: { lane: row, laneCol: gap, steps: [[gap, srow], [cx, srow]], lookAt: [cx, srow + 1] },
    visitor: { lane: row, laneCol: gap, steps: [[gap, srow]], lookAt: [cx, srow] },
  };
}

const CEO_SPOT: Spot = { lane: 2, laneCol: 6.9, steps: [[6.9, 7.85]], lookAt: [6.9, 9.75] };
const COFFEE_SPOTS: Spot[] = [
  { lane: 2, laneCol: 11.3, steps: [[11.3, 9.0]], lookAt: [11.9, 7.9] },
  { lane: 2, laneCol: 10.6, steps: [[10.6, 9.3]], lookAt: [11.9, 7.9] },
];
const LOUNGE_SPOTS: Spot[] = [
  { lane: 2, laneCol: 1.9, steps: [[1.9, 7.7]], lookAt: [0.75, 7.4] },
  { lane: 2, laneCol: 2.3, steps: [[2.3, 8.5]], lookAt: [0.75, 7.4] },
];

function nearestGap(col: number) {
  let best = ROW2_GAPS[0]!;
  for (const g of ROW2_GAPS) if (Math.abs(g - col) < Math.abs(best - col)) best = g;
  return best;
}

/** Waypoints from spot A to spot B along the lanes. */
function route(a: Spot, b: Spot): Pt[] {
  const pts: Pt[] = [];
  for (let i = a.steps.length - 2; i >= 0; i--) pts.push(a.steps[i]!);
  pts.push([a.laneCol, LANE_ROW[a.lane]]);
  if (a.lane !== b.lane) {
    const g = nearestGap(a.laneCol);
    pts.push([g, LANE_ROW[a.lane]], [g, LANE_ROW[b.lane]]);
  }
  pts.push([b.laneCol, LANE_ROW[b.lane]]);
  for (const s of b.steps) pts.push(s);
  // drop duplicates
  const out: Pt[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last[0] - p[0]) > 1e-3 || Math.abs(last[1] - p[1]) > 1e-3) out.push(p);
  }
  return out;
}

/* ---------------- actors ---------------- */

type Facing = { right: boolean; away: boolean };
type TripKind = 'handoff' | 'coffee' | 'lounge' | 'visit';

interface Trip {
  kind: TripKind;
  dest: Spot;
  path: Pt[];
  i: number;
  phase: 'go' | 'stay' | 'back';
  stayUntil: number;
  arrived: boolean;
}

interface Actor {
  agent: StudioAgent;
  plan: SeatPlan;
  root: Container;
  body: Graphics;
  /** rendered character (null -> procedural fallback drawn into `body`) */
  sprite: Sprite;
  clipName: string;
  animT: number;
  /** per-actor phase so sit/type loops never land on the same frame */
  animPhase: number;
  /** personal walk speed (units/s) */
  walkSpeed: number;
  /** seated celebration before walking work over */
  cheerUntil: number;
  handoffPending: boolean;
  glow: Graphics;
  bubble: Container;
  bubbleBg: Graphics;
  bubblePoll: Graphics;
  bubbleText: Text;
  tag: Container;
  tagBg: Graphics;
  tagName: Text;
  tagRole: Text;
  tagStatus: Text;
  ring: Graphics;
  phase: number;
  /** current floor position (units) */
  pos: Pt;
  facing: Facing;
  mode: 'seated' | 'walking' | 'standing';
  trip: Trip | null;
  nextAmbientAt: number;
  monitor: Pt;
  prevMood: AgentMood;
}

function facingTowards(from: Pt, to: Pt): Facing {
  const dcol = to[0] - from[0];
  const drow = to[1] - from[1];
  // Screen-space delta. Sheets are true side-profiles (not iso 3/4),
  // so we steer almost entirely by horizontal screen motion and flip the
  // right-facing sheet when moving left — stops moonwalk / sideways slide.
  const dx = dcol * COLV[0] + drow * ROWV[0];
  const dy = dcol * COLV[1] + drow * ROWV[1];
  return { right: dx >= 0, away: Math.abs(dy) > Math.abs(dx) * 2.2 && dy < 0 };
}

function drawPerson(a: Actor, t: number, mood: AgentMood) {
  const g = a.body;
  const look = LOOKS[a.agent.id];
  const c = a.agent.color;
  const s = PX_M * 1.08;
  g.clear();
  const seated = a.mode === 'seated';
  const walking = a.mode === 'walking';
  const working = seated && mood === 'working';
  const bob = walking
    ? Math.abs(Math.sin(t * 9 + a.phase)) * 3
    : Math.sin(t * (working ? 5.5 : 1.5) + a.phase) * (working ? 1.5 : 2.5);
  const typing = working ? Math.sin(t * 11 + a.phase) * 3 : 0;
  const swing = walking ? Math.sin(t * 9 + a.phase) : 0;

  // standing bodies are lifted so legs show below the hips
  const lift = seated ? 0 : 0.36 * s;
  const hipY = -0.45 * s - lift;
  const shoulderY = -1.02 * s + bob - lift;
  const headY = -1.3 * s + bob - lift;
  const torsoW = 0.42 * s;

  // generous invisible hit box
  g.rect(-0.5 * s, headY - 0.3 * s, 1.0 * s, -headY + 0.3 * s + 0.1 * s).fill({ color: 0xffffff, alpha: 0.001 });

  if (!seated) {
    // shadow + legs
    g.ellipse(0, 4, 0.3 * s, 0.11 * s).fill({ color: 0x000000, alpha: 0.28 });
    const legW = 0.14 * s;
    const legH = -hipY + 0.02 * s;
    for (const side of [-1, 1]) {
      const k = swing * side;
      const x = side * 0.1 * s;
      g.roundRect(x - legW / 2 + k * 0.05 * s, hipY + 0.02 * s, legW, legH * (1 - Math.max(0, k) * 0.18), 8).fill(0x1b1030);
      g.roundRect(x - legW / 2 - 0.01 * s + k * 0.08 * s, -0.02 * s - Math.max(0, k) * 0.06 * s, legW + 0.02 * s, 0.07 * s, 4).fill(
        0x2d2340,
      );
    }
  }

  g.roundRect(-torsoW / 2, hipY - 0.06 * s, torsoW, 0.16 * s, 10).fill(0x1b1030);
  g.roundRect(-torsoW / 2, shoulderY, torsoW, hipY - shoulderY + 0.08 * s, 16).fill(c);
  g.roundRect(-torsoW / 2, shoulderY + (hipY - shoulderY) * 0.55, torsoW, (hipY - shoulderY) * 0.45 + 0.08 * s, 14).fill({
    color: darken(c, 0.6),
    alpha: 0.5,
  });
  if (!a.facing.away) g.poly([-0.07 * s, shoulderY, 0.07 * s, shoulderY, 0, shoulderY + 0.1 * s]).fill(look.skin);
  const armLen = 0.36 * s;
  for (const side of [-1, 1]) {
    const x0 = side * (torsoW / 2 - 0.02 * s);
    const armSwing = walking ? swing * side * 0.12 * s : 0;
    const dropY = seated ? 0 : 0.08 * s;
    g.roundRect(x0 - 0.05 * s + armSwing * 0.5, shoulderY + 0.05 * s, 0.1 * s, armLen + dropY, 10).fill(c);
    g.circle(x0 + side * 0.02 * s + armSwing, shoulderY + 0.05 * s + armLen + dropY + typing * side, 0.055 * s).fill(look.skin);
  }
  g.roundRect(-0.05 * s, headY + 0.1 * s, 0.1 * s, 0.12 * s, 6).fill(darken(look.skin, 0.85));
  g.circle(0, headY, 0.155 * s).fill(look.skin);
  const hr = 0.165 * s;
  if (look.hairStyle === 'short') {
    g.ellipse(0, headY - 0.06 * s, hr, 0.1 * s).fill(look.hair);
  } else if (look.hairStyle === 'bun') {
    g.ellipse(0, headY - 0.06 * s, hr, 0.1 * s).fill(look.hair);
    g.circle(0, headY - 0.2 * s, 0.07 * s).fill(look.hair);
  } else if (look.hairStyle === 'curly') {
    g.ellipse(0, headY - 0.07 * s, hr * 1.12, 0.13 * s).fill(look.hair);
    g.circle(-hr, headY - 0.02 * s, 0.05 * s).fill(look.hair);
    g.circle(hr, headY - 0.02 * s, 0.05 * s).fill(look.hair);
  } else {
    g.ellipse(0, headY - 0.06 * s, hr, 0.1 * s).fill(look.hair);
    g.roundRect(-hr, headY - 0.04 * s, 0.07 * s, 0.34 * s, 8).fill(look.hair);
    g.roundRect(hr - 0.07 * s, headY - 0.04 * s, 0.07 * s, 0.34 * s, 8).fill(look.hair);
  }
  if (a.facing.away) {
    // back of the head
    g.ellipse(0, headY - 0.01 * s, hr * 0.98, 0.14 * s).fill(look.hair);
  } else {
    const eyeShift = a.facing.right ? 0.02 * s : -0.02 * s;
    g.circle(-0.05 * s + eyeShift, headY + 0.01 * s, 2.4).fill(0x1b1030);
    g.circle(0.05 * s + eyeShift, headY + 0.01 * s, 2.4).fill(0x1b1030);
  }
  g.scale.x = a.facing.right ? -1 : 1;
}

/** head position in plate px for the current pose */
function headPx(a: Actor): Pt {
  const [fx, fy] = toPx(a.pos[0], a.pos[1]);
  if (a.sprite.visible) return [fx, fy - (a.mode === 'seated' ? 1.22 : 1.7) * PX_M];
  const s = PX_M * 1.08;
  return [fx, fy - (a.mode === 'seated' ? 1.3 * s : 1.66 * s)];
}

function facingKey(f: Facing, _fourWay: boolean) {
  // Always use the right-facing profile sheets (*_dl / walk_dl). We mirror
  // with scale.x when moving left — one gait, correct foot direction.
  void _fourWay;
  return 'dl';
}

/** Which sheet clip the actor should be playing right now. */
function pickClip(a: Actor, mood: AgentMood, now: number): string {
  if (a.mode === 'walking') return `walk_${facingKey(a.facing, true)}`;
  if (a.mode === 'standing') {
    const two = facingKey(a.facing, false);
    if (a.trip?.kind === 'coffee') return `idle_${two}`;
    if (a.trip?.kind === 'lounge') return Math.sin(now * 0.0007 + a.phase) > 0 ? `idle_${two}` : `chat_${two}`;
    return `chat_${two}`;
  }
  if (now < a.cheerUntil) return 'cheer_dl';
  // working: mostly typing, but every other stretch they lean back / idle-sit so the
  // row doesn't look like a typing choir
  if (mood === 'working') {
    const beat = (now * 0.001 + a.phase * 4) % 14;
    return beat < 9 ? 'type_dl' : 'sit_dl';
  }
  return 'sit_dl';
}

/** Advance + show the sprite frame; draws only the ground shadow into `body`. */
function animateSprite(a: Actor, tex: CharTextures, mood: AgentMood, dt: number, now: number) {
  const want = pickClip(a, mood, now);
  const ct = tex[want] ?? tex['sit_dl'] ?? Object.values(tex)[0]!;
  if (a.clipName !== want) a.clipName = want;
  a.animT += dt;
  const n = ct.frames.length;
  // phase is sticky — never reset — so two agents on the same clip stay out of sync
  let fi = Math.floor((a.animT + a.animPhase) * OFFICE_SPRITES.fps);
  fi = ct.clip.loop ? ((fi % n) + n) % n : Math.min(Math.max(0, fi), n - 1);
  a.sprite.texture = ct.frames[fi]!;
  a.sprite.anchor.set(ct.clip.ax / ct.clip.fw, ct.clip.ay / ct.clip.fh);
  // walk_dl faces screen-right; mirror when heading left
  const sx = a.facing.right ? SPRITE_SCALE : -SPRITE_SCALE;
  a.sprite.scale.set(sx, SPRITE_SCALE);
  a.sprite.visible = true;
  const g = a.body;
  g.clear();
  if (a.mode !== 'seated') g.ellipse(0, 2, 0.32 * PX_M, 0.13 * PX_M).fill({ color: 0x000000, alpha: 0.26 });
}

function drawGlow(a: Actor, on: boolean, t: number) {
  const g = a.glow;
  g.clear();
  if (!on) return;
  const k = 0.6 + 0.25 * Math.sin(t * 7 + a.phase);
  const [mx, my] = a.monitor;
  const [fx, fy] = toPx(a.pos[0], a.pos[1]);
  g.ellipse(mx, my + 10, 110, 60).fill({ color: a.agent.color, alpha: 0.1 * k });
  g.ellipse(mx, my + 10, 60, 32).fill({ color: a.agent.color, alpha: 0.16 * k });
  g.ellipse(fx, fy - 0.9 * PX_M, 70, 90).fill({ color: a.agent.color, alpha: 0.08 * k });
}

/** Floating name tag above the head (name + role + optional status). */
function layoutTag(a: Actor, selected: boolean) {
  const [hx, hy] = headPx(a);
  const padX = 12;
  const nameW = a.tagName.width;
  const roleW = a.tagRole.width;
  const statusW = a.tagStatus.visible ? a.tagStatus.width : 0;
  const w = Math.max(nameW, roleW, statusW) + padX * 2 + 14;
  const h = a.tagStatus.visible ? 62 : 46;
  a.tag.position.set(hx, hy - 0.26 * PX_M - h - 8);
  a.tagBg.clear();
  a.tagBg.roundRect(-w / 2, 0, w, h, 9).fill({ color: 0x0c0718, alpha: selected ? 0.92 : 0.72 });
  if (selected) a.tagBg.roundRect(-w / 2, 0, w, h, 9).stroke({ width: 2, color: a.agent.color, alpha: 0.9 });
  a.tagBg.poly([-6, h, 6, h, 0, h + 7]).fill({ color: 0x0c0718, alpha: selected ? 0.92 : 0.72 });
  a.tagBg.circle(-w / 2 + padX + 4, 13, 4.5).fill(a.agent.color);
  a.tagName.position.set(-w / 2 + padX + 14, 4);
  a.tagRole.position.set(-w / 2 + padX, 22);
  a.tagStatus.position.set(-w / 2 + padX, 38);
}

function setBubble(a: Actor, mood: AgentMood, t: number) {
  const b = a.bubble;
  const coffee = a.trip?.kind === 'coffee' && a.trip.phase === 'stay';
  const working = mood === 'working' && !coffee;
  if (mood !== 'waiting_ceo' && mood !== 'handoff' && !coffee && !working) {
    b.visible = false;
    return;
  }
  b.visible = true;
  const [hx] = headPx(a);
  const tagTop = a.tag.position.y;
  a.bubblePoll.clear();

  if (working) {
    const y = tagTop - 20 + Math.sin(t * 3 + a.phase) * 2;
    b.position.set(hx + 22, y);
    const pulse = 0.28 + 0.22 * (0.5 + 0.5 * Math.sin(t * 5 + a.phase));
    a.bubbleBg.clear();
    a.bubbleBg.circle(0, 0, 16).fill({ color: 0x7dd3fc, alpha: pulse });
    a.bubbleBg.circle(0, 0, 11).fill(0x0c1220);
    a.bubbleBg.circle(0, 0, 11).stroke({ width: 1.4, color: 0x7dd3fc, alpha: 0.95 });
    const step = Math.floor(t * 3.2 + a.phase) % 3;
    for (let i = 0; i < 3; i++) {
      a.bubblePoll.circle(-5 + i * 5, 0, 1.6).fill({ color: 0xe8f4ff, alpha: i === step ? 1 : 0.22 });
    }
    a.bubbleText.visible = false;
    return;
  }

  a.bubbleText.visible = true;
  let text = '?';
  let color = 0xffc14a;
  let y = tagTop - 34;
  if (mood === 'waiting_ceo') {
    y += Math.sin(t * 4) * 5;
  } else if (mood === 'handoff') {
    text = '✓';
    color = 0x34d399;
  } else {
    text = '☕';
    color = 0xf4e3c6;
  }
  b.position.set(hx, y);
  if (a.bubbleText.text !== text) a.bubbleText.text = text;
  a.bubbleBg.clear();
  a.bubbleBg.circle(0, 0, 22).fill(color);
}

function buildActor(agent: StudioAgent): Actor {
  const seat = CAL.seats[agent.id]!;
  const plan = seatPlan(agent.id, seat.unit, seat.feet);
  const root = new Container();
  root.eventMode = 'static';
  root.cursor = 'pointer';

  const ring = new Graphics();
  ring.ellipse(0, 6, 92, 42).stroke({ width: 5, color: agent.color, alpha: 0.95 });
  ring.ellipse(0, 6, 92, 42).fill({ color: agent.color, alpha: 0.12 });
  ring.visible = false;
  root.addChild(ring);

  const body = new Graphics();
  root.addChild(body);
  const sprite = new Sprite(Texture.EMPTY);
  sprite.visible = false;
  sprite.eventMode = 'static';
  // Sheets render washed/over-bright under the loft grade — warm + darken.
  const grade = new ColorMatrixFilter();
  grade.brightness(0.82, false);
  grade.saturate(0.12, true);
  grade.contrast(1.08, true);
  sprite.filters = [grade];
  root.addChild(sprite);

  const tag = new Container();
  tag.eventMode = 'none';
  const tagBg = new Graphics();
  const tagName = new Text({ text: agent.name.toUpperCase(), style: { ...LABEL, fontSize: 18, dropShadow: false } });
  const tagRole = new Text({ text: agent.role, style: { ...SMALL, fontSize: 12, fill: 0xb9afc9, dropShadow: false } });
  const tagStatus = new Text({ text: '', style: { ...SMALL, fontSize: 12, fill: 0xcfc3dc, dropShadow: false } });
  tag.addChild(tagBg, tagName, tagRole, tagStatus);

  const bubble = new Container();
  const bubbleBg = new Graphics();
  const bubblePoll = new Graphics();
  const bubbleText = new Text({ text: '', style: { ...LABEL, fontSize: 26, fill: 0x12080c, dropShadow: false } });
  bubbleText.anchor.set(0.5);
  bubble.addChild(bubbleBg, bubblePoll, bubbleText);
  bubble.visible = false;

  return {
    agent,
    plan,
    root,
    body,
    sprite,
    clipName: '',
    animT: Math.random() * 8,
    animPhase: Math.random() * 40,
    walkSpeed: WALK_SPEED * (0.78 + Math.random() * 0.5),
    cheerUntil: 0,
    handoffPending: false,
    glow: new Graphics(),
    bubble,
    bubbleBg,
    bubblePoll,
    bubbleText,
    tag,
    tagBg,
    tagName,
    tagRole,
    tagStatus,
    ring,
    phase: Math.random() * Math.PI * 2,
    pos: [plan.unit[0], plan.unit[1] - 0.12],
    facing: { right: false, away: false },
    mode: 'seated',
    trip: null,
    // stagger first break so they don't all stand up together
    nextAmbientAt: performance.now() + 12000 + Math.random() * 90000,
    monitor: seat.monitor,
    prevMood: 'idle',
  };
}

/* ---------------- flying hand-off documents ---------------- */

interface Flyer {
  g: Graphics;
  from: Pt;
  to: Pt;
  t0: number;
  dur: number;
}

/* ---------------- whiteboard kanban ---------------- */

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/* ---------------- component ---------------- */

export function OfficeScene(props: OfficeSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const dirtyRef = useRef(true);

  useEffect(() => {
    dirtyRef.current = true;
  }, [props.states, props.boardCards, props.inboxCount, props.selected]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const app = new Application();
    let destroyed = false;
    let detachResize: (() => void) | null = null;

    (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });
      if (destroyed) {
        app.destroy(true);
        return;
      }
      host.appendChild(app.canvas as HTMLCanvasElement);

      const propDefs = Object.entries(CAL.props ?? {});
      const layered = propDefs.length > 0;
      const [plates, charTex] = await Promise.all([
        Promise.all([
          Assets.load(PLATE_ROOM),
          ...(layered ? propDefs.map(([, p]) => Assets.load(p.src)) : [Assets.load(PLATE_FRONT)]),
        ]) as Promise<Texture[]>,
        loadCharacterSheets(AGENTS.map((a) => a.id)),
      ]);
      const [roomTex, ...rest] = plates;
      if (destroyed) return;

      const root = new Container();
      app.stage.addChild(root);
      app.stage.eventMode = 'static';
      app.stage.hitArea = { contains: () => true };
      // taps are ignored right after a drag-pan
      let suppressTapUntil = 0;
      const tapOk = () => performance.now() > suppressTapUntil;
      app.stage.on('pointertap', (e) => {
        if (e.target === app.stage && tapOk()) propsRef.current.onSelect(null);
      });

      /* 1. room plate (walls, floor, back furniture) */
      const room = new Sprite(roomTex!);
      root.addChild(room);

      /* 2. monitor glow (under people, over room) */
      const glowLayer = new Container();
      glowLayer.blendMode = 'add';
      root.addChild(glowLayer);

      /* 3. the world: people + front props, y-sorted every frame */
      const world = new Container();
      world.sortableChildren = true;
      root.addChild(world);

      const actors = AGENTS.filter((a) => CAL.seats[a.id]).map(buildActor);
      for (const a of actors) {
        a.root.on('pointertap', (e) => {
          e.stopPropagation();
          if (tapOk()) propsRef.current.onSelect({ type: 'agent', id: a.agent.id });
        });
        world.addChild(a.root);
        glowLayer.addChild(a.glow);
      }

      if (layered) {
        propDefs.forEach(([, p], i) => {
          const sp = new Sprite(rest[i]!);
          sp.position.set(p.x, p.y);
          sp.zIndex = p.depth;
          sp.eventMode = 'none';
          world.addChild(sp);
        });
      } else {
        // legacy single front plate: always in front of everyone
        const front = new Sprite(rest[0]!);
        front.eventMode = 'none';
        front.zIndex = 1e6;
        world.addChild(front);
      }

      /* 4. overlays */
      const ui = new Container();
      root.addChild(ui);

      // Pipeline board lives in the header "Board" modal.
      const drawBoardCards = (_cols: BoardCard[][]) => {
        /* no wall overlay */
      };
      const boardSel = { visible: false };

      /* CEO desk hotspot + label */
      const ceo = new Container();
      ceo.eventMode = 'static';
      ceo.cursor = 'pointer';
      ceo.on('pointertap', (e) => {
        e.stopPropagation();
        if (tapOk()) propsRef.current.onSelect({ type: 'ceo' });
      });
      const [cx, cy] = CAL.ceo.label;
      const ceoHit = new Graphics();
      ceoHit.rect(cx - 240, CAL.ceo.deskTop[1] - 140, 480, cy - CAL.ceo.deskTop[1] + 200).fill({ color: 0xffffff, alpha: 0.001 });
      const ceoLabel = new Text({ text: 'YOU · HEAD OF DESIGN', style: { ...LABEL, fontSize: 26, fill: 0xffc14a } });
      ceoLabel.anchor.set(0.5, 0);
      ceoLabel.position.set(cx, cy + 6);
      const ceoBadge = new Graphics();
      const ceoBadgeText = new Text({ text: '', style: { ...LABEL, fontSize: 20, fill: 0x12080c, dropShadow: false } });
      ceoBadgeText.anchor.set(0.5);
      ceo.addChild(ceoHit, ceoLabel, ceoBadge, ceoBadgeText);
      ui.addChild(ceo);

      /* tags + bubbles above everything */
      for (const a of actors) ui.addChild(a.tag, a.bubble);

      /* flying documents layer */
      const flyLayer = new Container();
      ui.addChild(flyLayer);
      const flyers: Flyer[] = [];
      const spawnFlyer = (a: Actor) => {
        const g = new Graphics();
        g.roundRect(-14, -18, 28, 36, 4).fill(0xf7f2ff);
        g.roundRect(-9, -10, 18, 3, 1).fill(a.agent.color);
        g.roundRect(-9, -3, 18, 3, 1).fill(0xb9afc9);
        g.roundRect(-9, 4, 12, 3, 1).fill(0xb9afc9);
        flyLayer.addChild(g);
        const [hx, hy] = headPx(a);
        flyers.push({ g, from: [hx, hy + 40], to: CAL.ceo.deskTop, t0: performance.now(), dur: 900 });
      };

      /* ---------- trips: walking the floor ---------- */
      const occupied = new Set<Spot>();
      const startTrip = (a: Actor, kind: TripKind, dest: Spot, stayMs: number) => {
        occupied.add(dest);
        a.trip = {
          kind,
          dest,
          path: route(a.plan.spot, dest),
          i: 0,
          phase: 'go',
          stayUntil: 0,
          arrived: false,
        };
        a.trip.stayUntil = stayMs;
        a.mode = 'walking';
      };
      const freeSpot = (spots: Spot[]) => spots.find((s) => !occupied.has(s)) ?? null;
      // each agent has a preferred break habit so they don't all go for coffee
      const habit: Record<string, TripKind[]> = {
        lead: ['visit', 'coffee', 'lounge'],
        librarian: ['lounge', 'visit', 'coffee'],
        designer: ['coffee', 'visit', 'lounge'],
        ui_engineer: ['visit', 'lounge', 'coffee'],
        tokens: ['coffee', 'lounge', 'visit'],
        engineer: ['coffee', 'visit', 'lounge'],
        qa: ['lounge', 'coffee', 'visit'],
      };
      const pickAmbient = (a: Actor): [TripKind, Spot, number] | null => {
        // at most 2 people off their desks at once
        if (actors.filter((o) => o.trip).length >= 2) return null;
        const prefs = habit[a.agent.id] ?? ['coffee', 'lounge', 'visit'];
        for (const kind of prefs) {
          if (Math.random() > 0.7) continue; // sometimes skip preferred
          if (kind === 'coffee') {
            const s = freeSpot(COFFEE_SPOTS);
            if (s) return ['coffee', s, 6000 + Math.random() * 9000];
          } else if (kind === 'lounge') {
            const s = freeSpot(LOUNGE_SPOTS);
            if (s) return ['lounge', s, 8000 + Math.random() * 12000];
          } else {
            const seated = actors.filter((o) => o !== a && o.mode === 'seated' && !occupied.has(o.plan.visitor));
            if (seated.length) {
              const o = seated[Math.floor(Math.random() * seated.length)]!;
              return ['visit', o.plan.visitor, 5000 + Math.random() * 8000];
            }
          }
        }
        return null;
      };

      const stepTrip = (a: Actor, dt: number, now: number) => {
        const trip = a.trip;
        if (!trip) return;
        if (trip.phase === 'stay') {
          a.mode = 'standing';
          a.facing = facingTowards(a.pos, trip.dest.lookAt);
          if (now >= trip.stayUntil) {
            trip.phase = 'back';
            trip.path = route(trip.dest, a.plan.spot);
            trip.i = 0;
            a.mode = 'walking';
            occupied.delete(trip.dest);
          }
          return;
        }
        let budget = a.walkSpeed * dt;
        while (budget > 0 && trip.i < trip.path.length) {
          const target = trip.path[trip.i]!;
          const dc = target[0] - a.pos[0];
          const dr = target[1] - a.pos[1];
          const dist = Math.hypot(dc, dr);
          if (dist <= budget) {
            a.pos = [target[0], target[1]];
            budget -= dist;
            trip.i++;
          } else {
            a.pos = [a.pos[0] + (dc / dist) * budget, a.pos[1] + (dr / dist) * budget];
            a.facing = facingTowards([0, 0], [dc, dr]);
            budget = 0;
          }
        }
        if (trip.i >= trip.path.length) {
          if (trip.phase === 'go') {
            trip.phase = 'stay';
            trip.stayUntil = now + trip.stayUntil;
            a.mode = 'standing';
            if (trip.kind === 'handoff' && !trip.arrived) {
              trip.arrived = true;
              spawnFlyer(a);
            }
          } else {
            a.trip = null;
            a.mode = 'seated';
            // sit a touch back from the desk so hips land in the chair, not the desk edge
            a.pos = [a.plan.unit[0], a.plan.unit[1] - 0.12];
            a.facing = { right: false, away: false };
            a.nextAmbientAt = now + 25000 + Math.random() * 60000;
          }
        }
      };

      /* apply props */
      const applyProps = () => {
        const p = propsRef.current;
        for (const a of actors) {
          const s = p.states[a.agent.id];
          const txt = s?.activeTask
            ? `${truncate(s.activeTask.title, 26)} · ${Math.round(s.activeTask.progress)}%`
            : s?.mood === 'waiting_ceo'
              ? 'waiting on you'
              : s?.queue.length
                ? `next: ${truncate(s.queue[0]!.title, 22)}`
                : '';
          a.tagStatus.visible = txt.length > 0;
          if (a.tagStatus.text !== txt) a.tagStatus.text = txt;
        }
        drawBoardCards(p.boardCards);
        ceoBadge.clear();
        if (p.inboxCount > 0) {
          ceoBadge.circle(cx + 96, cy + 20, 18).fill(0xffc14a);
          ceoBadgeText.position.set(cx + 96, cy + 20);
          ceoBadgeText.text = String(p.inboxCount);
          ceoBadgeText.visible = true;
        } else {
          ceoBadgeText.visible = false;
        }
        boardSel.visible = p.selected?.type === 'board';
      };

      /* ---------- camera: cover the screen with the room, zoom + pan, clamped ---------- */
      // The plate now includes the exterior, so the camera may roam the whole image.
      const [W, H] = CAL.resolution;
      const ROOM = { x0: 0, x1: W, y0: 0, y1: H };
      const cam = { zoom: 1, x: 0, y: 0 }; // zoom relative to "cover" scale
      let coverScale = 1;
      const ZOOM_MIN = 1.0;
      const ZOOM_MAX = 3.0;
      const ZOOM_DEFAULT = 1.0;

      const clampCam = () => {
        const w = app.screen.width;
        const h = app.screen.height;
        const s = coverScale * cam.zoom;
        const minX = w - ROOM.x1 * s;
        const maxX = -ROOM.x0 * s;
        const minY = h - ROOM.y1 * s;
        const maxY = -ROOM.y0 * s;
        cam.x = minX > maxX ? (minX + maxX) / 2 : Math.min(maxX, Math.max(minX, cam.x));
        cam.y = minY > maxY ? (minY + maxY) / 2 : Math.min(maxY, Math.max(minY, cam.y));
        root.scale.set(s);
        root.position.set(cam.x, cam.y);
      };

      const centreOn = (px: number, py: number) => {
        const s = coverScale * cam.zoom;
        cam.x = app.screen.width / 2 - px * s;
        cam.y = app.screen.height / 2 - py * s;
        clampCam();
      };

      const fit = () => {
        const w = app.screen.width;
        const h = app.screen.height;
        coverScale = Math.max(w / (ROOM.x1 - ROOM.x0), h / (ROOM.y1 - ROOM.y0));
        clampCam();
      };
      fit();
      cam.zoom = ZOOM_DEFAULT;
      centreOn((CAL.floor.c00[0] + CAL.floor.c11[0]) / 2, (CAL.floor.c00[1] + CAL.floor.c11[1]) / 2 - 0.9 * PX_M);
      app.renderer.on('resize', fit);

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = host.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const before = coverScale * cam.zoom;
        const factor = Math.exp(-e.deltaY * 0.0016);
        cam.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, cam.zoom * factor));
        const after = coverScale * cam.zoom;
        const px = (mx - cam.x) / before;
        const py = (my - cam.y) / before;
        cam.x = mx - px * after;
        cam.y = my - py * after;
        clampCam();
      };
      host.addEventListener('wheel', onWheel, { passive: false });

      // NB: no pointer capture here — capturing on the host would steal pointerup from
      // the Pixi canvas and taps on people/board would never complete.
      let drag: { sx: number; sy: number; cx: number; cy: number; moved: boolean } | null = null;
      const onDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false };
      };
      const onMove = (e: PointerEvent) => {
        if (!drag) return;
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) < 5) return;
        drag.moved = true;
        host.style.cursor = 'grabbing';
        cam.x = drag.cx + dx;
        cam.y = drag.cy + dy;
        clampCam();
      };
      const onUp = () => {
        if (!drag) return;
        if (drag.moved) suppressTapUntil = performance.now() + 80;
        drag = null;
        host.style.cursor = '';
      };
      host.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);

      detachResize = () => {
        app.renderer.off('resize', fit);
        host.removeEventListener('wheel', onWheel);
        host.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      let t = 0;
      app.ticker.add((ticker) => {
        const dt = Math.min(0.1, ticker.deltaMS / 1000);
        t += dt;
        const now = performance.now();
        if (dirtyRef.current) {
          dirtyRef.current = false;
          applyProps();
        }
        const p = propsRef.current;
        for (const a of actors) {
          const mood = p.states[a.agent.id]?.mood ?? 'idle';

          // finished work → little celebration at the desk, then walk it over to the CEO
          if (mood === 'handoff' && a.prevMood !== 'handoff' && !a.trip) {
            a.cheerUntil = now + 2600;
            a.handoffPending = true;
          }
          if (a.handoffPending && now >= a.cheerUntil && !a.trip) {
            a.handoffPending = false;
            startTrip(a, 'handoff', CEO_SPOT, 2200);
          }
          // nothing to do → stretch the legs now and then
          if (!a.trip && now > a.nextAmbientAt) {
            const canLeave = mood === 'idle' || (mood === 'working' && Math.random() < 0.35);
            const pick = canLeave ? pickAmbient(a) : null;
            if (pick) startTrip(a, pick[0], pick[1], pick[2]);
            else a.nextAmbientAt = now + 15000 + Math.random() * 30000;
          }
          a.prevMood = mood;

          stepTrip(a, dt, now);

          const [fx, fy] = toPx(a.pos[0], a.pos[1]);
          a.root.position.set(fx, fy);
          a.root.zIndex = fy;
          const tex = charTex[a.agent.id];
          if (tex) animateSprite(a, tex, mood, dt, now);
          else drawPerson(a, t, mood);
          drawGlow(a, a.mode === 'seated' && mood === 'working', t);
          const sel = p.selected?.type === 'agent' && p.selected.id === a.agent.id;
          a.ring.visible = sel;
          layoutTag(a, sel);
          setBubble(a, mood, t);
        }
        for (let i = flyers.length - 1; i >= 0; i--) {
          const f = flyers[i]!;
          const k = Math.min(1, (now - f.t0) / f.dur);
          const e = k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k;
          const x = f.from[0] + (f.to[0] - f.from[0]) * e;
          const y = f.from[1] + (f.to[1] - f.from[1]) * e - Math.sin(k * Math.PI) * 120;
          f.g.position.set(x, y);
          f.g.rotation = Math.sin(k * Math.PI * 2) * 0.25;
          f.g.alpha = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1;
          if (k >= 1) {
            f.g.destroy();
            flyers.splice(i, 1);
          }
        }
      });
    })().catch((err) => {
      console.error('[office] scene failed', err);
    });

    return () => {
      destroyed = true;
      detachResize?.();
      try {
        app.destroy(true, { children: true });
      } catch {
        /* not yet initialised */
      }
    };
  }, []);

  return <div ref={hostRef} className="ge-studio__canvas" aria-label="Studio floor" />;
}
