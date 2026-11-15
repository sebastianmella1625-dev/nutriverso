import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {SENTENCES, f} from "./timing";

export const C = {
  bg: "#05070f",
  panel: "#111a2e",
  line: "#22304d",
  text: "#e6ebf5",
  dim: "#9aa6bf",
  accent: "#00a9e4",
  amber: "#f0a929",
  green: "#79bc3a",
  red: "#ef5a4f",
};
export const SANS = "'Segoe UI', 'Inter', system-ui, sans-serif";
export const MONO = "Consolas, 'Cascadia Mono', monospace";

// Real screenshots, native pixel size (deviceScaleFactor 2).
export const IMG = {
  body: {src: "capturas/01-crew-body.png", w: 780, h: 1688},
  bone: {src: "capturas/02-crew-bone.png", w: 780, h: 1688},
  sent: {src: "capturas/04-crew-report-sent.png", w: 780, h: 1688},
  ground: {src: "capturas/05-ground-console.png", w: 2880, h: 1800},
  groundFull: {src: "capturas/06-ground-full.png", w: 2880, h: 3468},
} as const;
export type ImgDef = (typeof IMG)[keyof typeof IMG];

export type Rect = [number, number, number, number]; // x, y, w, h in native image pixels
export type Key = {at: number; r: Rect}; // `at` = local frame

const ease = Easing.bezier(0.45, 0, 0.2, 1);

export const lerpRect = (frame: number, keys: Key[]): Rect => {
  if (frame <= keys[0].at) return keys[0].r;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.at) {
      const p = ease((frame - a.at) / Math.max(1, b.at - a.at));
      return a.r.map((v, k) => v + (b.r[k] - v) * p) as Rect;
    }
  }
  return keys[keys.length - 1].r;
};

export type Highlight = {r: Rect; from: number; to?: number; color?: string; label?: string; labelSide?: "top" | "bottom"; dim?: boolean};

// A window onto a screenshot with an animated camera (focus rect) and highlight boxes.
export const Shot: React.FC<{
  img: ImgDef;
  w: number;
  h: number;
  keys: Key[];
  boxes?: Highlight[];
  radius?: number;
  style?: React.CSSProperties;
}> = ({img, w, h, keys, boxes = [], radius = 0, style}) => {
  const frame = useCurrentFrame();
  const [rx, ry, rw, rh] = lerpRect(frame, keys);
  const s = Math.min(w / rw, h / rh);
  let ox = w / 2 - (rx + rw / 2) * s;
  let oy = h / 2 - (ry + rh / 2) * s;
  // keep the image covering the window when it is big enough
  if (img.w * s >= w) ox = Math.min(0, Math.max(w - img.w * s, ox));
  if (img.h * s >= h) oy = Math.min(0, Math.max(h - img.h * s, oy));
  return (
    <div style={{position: "relative", width: w, height: h, overflow: "hidden", borderRadius: radius, background: "#0b1020", ...style}}>
      <Img src={staticFile(img.src)} style={{position: "absolute", left: ox, top: oy, width: img.w * s, height: img.h * s}} />
      {boxes.map((b, i) => (
        <Box key={i} b={b} x={ox + b.r[0] * s} y={oy + b.r[1] * s} w={b.r[2] * s} h={b.r[3] * s} />
      ))}
    </div>
  );
};

const Box: React.FC<{b: Highlight; x: number; y: number; w: number; h: number}> = ({b, x, y, w, h}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame: frame - b.from, fps, config: {damping: 16, stiffness: 140}});
  const out = b.to === undefined ? 1 : interpolate(frame, [b.to, b.to + 6], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const o = Math.min(inP, out);
  if (o <= 0.001) return null;
  const color = b.color ?? C.accent;
  const pad = 6;
  const grow = interpolate(inP, [0, 1], [18, 0]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - pad - grow,
          top: y - pad - grow,
          width: w + 2 * (pad + grow),
          height: h + 2 * (pad + grow),
          border: `4px solid ${color}`,
          borderRadius: 14,
          boxShadow: `${b.dim === false ? "" : `0 0 0 9999px rgba(5,7,15,${0.42 * o}), `}0 0 28px ${color}`,
          opacity: o,
        }}
      />
      {b.label ? (
        <div
          style={{
            position: "absolute",
            left: x - pad,
            top: b.labelSide === "bottom" ? y + h + pad + 10 : y - pad - 52,
            padding: "6px 14px",
            background: color,
            color: C.bg,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 26,
            borderRadius: 10,
            opacity: o,
            whiteSpace: "nowrap",
          }}
        >
          {b.label}
        </div>
      ) : null}
    </>
  );
};

// Phone bezel (drawn in code) around a Shot of a phone screenshot.
export const Phone: React.FC<{img: ImgDef; x: number; y: number; h: number; keys: Key[]; boxes?: Highlight[]}> = ({img, x, y, h, keys, boxes}) => {
  const w = Math.round((h * img.w) / img.h);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 14,
        top: y - 14,
        padding: 14,
        borderRadius: 54,
        background: "linear-gradient(160deg,#2a3550,#0d1322)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px #33405f",
      }}
    >
      <Shot img={img} w={w} h={h} keys={keys} boxes={boxes} radius={40} />
    </div>
  );
};

export const phoneWidth = (img: ImgDef, h: number) => Math.round((h * img.w) / img.h);

// Magnified crop card: a fixed rect of a screenshot, scaled into a panel.
export const Card: React.FC<{img: ImgDef; r: Rect; w: number; from: number; x: number; y: number; title?: string; boxes?: Highlight[]}> = ({
  img,
  r,
  w,
  from,
  x,
  y,
  title,
  boxes,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - from, fps, config: {damping: 18, stiffness: 120}});
  const h = Math.round((w * r[3]) / r[2]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`,
        transformOrigin: "left center",
      }}
    >
      {title ? <Kicker>{title}</Kicker> : null}
      <div style={{borderRadius: 18, overflow: "hidden", boxShadow: `0 0 0 2px ${C.line}, 0 24px 60px rgba(0,0,0,0.55)`}}>
        <Shot img={img} w={w} h={h} keys={[{at: 0, r}]} boxes={boxes} />
      </div>
    </div>
  );
};

export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.accent}) => (
  <div style={{fontFamily: SANS, fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color, marginBottom: 12}}>
    {children}
  </div>
);

// Fade/slide in helper for kinetic text.
export const useIn = (from: number, dist = 30) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - from, fps, config: {damping: 18, stiffness: 130}});
  return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`};
};

export const Stars: React.FC = () => {
  const frame = useCurrentFrame();
  const stars = React.useMemo(
    () =>
      new Array(140).fill(0).map((_, i) => ({
        x: random(`x${i}`) * 1920,
        y: random(`y${i}`) * 1080,
        r: 0.6 + random(`r${i}`) * 1.6,
        a: 0.15 + random(`a${i}`) * 0.5,
        tw: random(`t${i}`) * 6,
      })),
    [],
  );
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 20%, #0c1530 0%, ${C.bg} 60%)`}}>
      <svg width={1920} height={1080}>
        {stars.map((s, i) => (
          <circle key={i} cx={(s.x - frame * 0.25 * s.r + 1920) % 1920} cy={s.y} r={s.r} fill="#cfe3ff" opacity={s.a * (0.75 + 0.25 * Math.sin(frame / 12 + s.tw))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const Tag: React.FC = () => (
  <div
    style={{
      position: "absolute",
      right: 36,
      top: 28,
      padding: "8px 16px",
      borderRadius: 999,
      border: `1.5px solid ${C.line}`,
      background: "rgba(10,16,32,0.85)",
      color: C.dim,
      fontFamily: SANS,
      fontSize: 22,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <span style={{width: 10, height: 10, borderRadius: 5, background: C.green, display: "inline-block"}} />
    Real app · simulated crew data
  </div>
);

// Burned-in subtitles: phrase chunks synced to Edge TTS word timings.
type Chunk = {text: string[]; starts: number[]; from: number; to: number};
const buildChunks = (): Chunk[] => {
  const out: Chunk[] = [];
  SENTENCES.forEach((s) => {
    const tokens = s.texto.split(/\s+/);
    const n = Math.min(tokens.length, s.words.length);
    let cur: Chunk | null = null;
    for (let i = 0; i < n; i++) {
      if (!cur) {
        cur = {text: [], starts: [], from: s.start + s.words[i].s, to: 0};
        out.push(cur);
      }
      cur.text.push(tokens[i]);
      cur.starts.push(s.start + s.words[i].s);
      const punct = /[,.;:]$/.test(tokens[i]);
      const punctNext = i + 1 < n && /[,.;:]$/.test(tokens[i + 1]);
      // break at punctuation, or after ~7 words without stranding a lone word before a comma
      const breakHere = (punct && cur.text.length >= 2) || (cur.text.length >= 7 && !punctNext) || cur.text.length >= 9;
      if (breakHere || i === n - 1) {
        cur.to = i === n - 1 ? s.end : s.start + s.words[i + 1].s;
        cur = null;
      }
    }
  });
  return out;
};
const CHUNKS = buildChunks();

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const c = CHUNKS.find((k) => t >= k.from - 0.05 && t < k.to);
  if (!c) return null;
  const local = frame - f(c.from);
  const o = interpolate(local, [0, 3], [0, 1], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity: o}}>
      <div
        style={{
          maxWidth: 1560,
          padding: "14px 34px 18px",
          borderRadius: 18,
          background: "rgba(5,7,15,0.88)",
          boxShadow: `0 0 0 2px ${C.line}`,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 54,
          lineHeight: 1.18,
          textAlign: "center",
          color: C.text,
        }}
      >
        {c.text.map((w, i) => (
          <span key={i} style={{opacity: t >= c.starts[i] - 0.04 ? 1 : 0.45}}>
            {w}
            {i < c.text.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
