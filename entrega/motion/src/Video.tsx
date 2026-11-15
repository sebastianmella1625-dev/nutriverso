import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {SENTENCES, TOTAL_FRAMES, f, sceneRange, wordAt} from "./timing";
import {C, Card, IMG, Kicker, MONO, Phone, SANS, Shot, Stars, Subtitles, Tag, useIn} from "./ui";

const XFADE = 8; // frames of overlap between scenes

// Local frame (inside a scene) when word n of a sentence starts.
const w = (id: string, n: number) => f(wordAt(id, n)) - sceneRange(id).from;

const Scene: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => {
  const {from, dur} = sceneRange(id);
  const last = id === SENTENCES[SENTENCES.length - 1].id;
  return (
    <Sequence from={from} durationInFrames={last ? dur : dur + XFADE} name={id}>
      <Fade first={from === 0}>{children}</Fade>
    </Sequence>
  );
};

const Fade: React.FC<{children: React.ReactNode; first: boolean}> = ({children, first}) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : interpolate(frame, [0, XFADE], [0, 1], {extrapolateRight: "clamp"});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const PHONE_H = 840;
const PHONE_Y = 34;
const PHONE_X = 230;
const RIGHT_X = 780;

// 1 · Hook: Earth–Mars signal delay (drawn in code)
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ex = 430;
  const mx = 1490;
  const cy = 470;
  const travel = ((frame % 54) / 54) * (mx - ex);
  const big = spring({frame: frame - 4, fps, config: {damping: 14, stiffness: 110}});
  const crew = useIn(w("hook", 12));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: "absolute"}}>
        <defs>
          <radialGradient id="earth" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#5cc8ff" />
            <stop offset="100%" stopColor="#0b4f8a" />
          </radialGradient>
          <radialGradient id="mars" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ff9b6a" />
            <stop offset="100%" stopColor="#8a2f17" />
          </radialGradient>
        </defs>
        <line x1={ex + 80} y1={cy} x2={mx - 60} y2={cy} stroke={C.accent} strokeWidth={3} strokeDasharray="10 14" opacity={0.6} />
        {[0, 0.33, 0.66].map((o, i) => {
          const x = ex + 80 + ((travel / (mx - ex) + o) % 1) * (mx - 60 - ex - 80);
          return <circle key={i} cx={x} cy={cy} r={9} fill={C.accent} opacity={0.9} />;
        })}
        <circle cx={ex} cy={cy} r={78} fill="url(#earth)" />
        <circle cx={mx} cy={cy} r={56} fill="url(#mars)" />
        <text x={ex} y={cy + 130} textAnchor="middle" fill={C.dim} fontFamily={SANS} fontSize={30} fontWeight={600}>
          Earth
        </text>
        <text x={mx} y={cy + 110} textAnchor="middle" fill={C.dim} fontFamily={SANS} fontSize={30} fontWeight={600}>
          Mars
        </text>
      </svg>
      <div style={{position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: SANS, opacity: big, transform: `scale(${0.85 + 0.15 * big})`}}>
        <div style={{fontSize: 150, fontWeight: 800, color: C.text, lineHeight: 1}}>
          3–<span style={{color: C.amber}}>22</span> min
        </div>
        <div style={{fontSize: 34, color: C.dim, marginTop: 14, fontWeight: 600}}>one-way signal delay between Earth and Mars</div>
      </div>
      <div style={{position: "absolute", top: 690, width: "100%", textAlign: "center", fontFamily: SANS, fontSize: 52, fontWeight: 700, color: C.text, ...crew}}>
        The crew must judge their <span style={{color: C.accent}}>own health</span>
      </div>
    </AbsoluteFill>
  );
};

const SYSTEMS: {name: string; state: "ok" | "alert"}[] = [
  {name: "Mind", state: "ok"},
  {name: "Heart", state: "ok"},
  {name: "Bone", state: "alert"},
  {name: "Muscle", state: "alert"},
  {name: "Immune & metabolic", state: "ok"},
];

// 2 · Body map, five systems
const Body: React.FC = () => {
  const {dur} = sceneRange("body");
  const title = useIn(2);
  return (
    <AbsoluteFill>
      <Phone
        img={IMG.body}
        x={PHONE_X}
        y={PHONE_Y}
        h={PHONE_H}
        keys={[
          {at: 0, r: [0, 0, 780, 1688]},
          {at: dur, r: [40, 400, 700, 1515]},
        ]}
        boxes={[{r: [212, 812, 356, 666], from: w("body", 3), color: C.accent}]}
      />
      <div style={{position: "absolute", left: RIGHT_X, top: 150, fontFamily: SANS, ...title}}>
        <Kicker>Crew app · body map</Kicker>
        <div style={{fontSize: 74, fontWeight: 800, color: C.text, lineHeight: 1.05}}>
          5 body systems,
          <br />
          one status light each
        </div>
      </div>
      <div style={{position: "absolute", left: RIGHT_X, top: 430, display: "flex", flexWrap: "wrap", gap: 18, width: 1000}}>
        {SYSTEMS.map((s, i) => (
          <Chip key={s.name} from={w("body", 2) + i * 5} color={s.state === "ok" ? C.green : C.amber} sym={s.state === "ok" ? "✓" : "▲"}>
            {s.name}
          </Chip>
        ))}
      </div>
      <div style={{position: "absolute", left: RIGHT_X, top: 640, fontFamily: SANS, fontSize: 30, color: C.dim, ...useIn(w("body", 6))}}>
        Simulated crew member: Bone and Muscle in alert
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{from: number; color: string; sym: string; children: React.ReactNode}> = ({from, color, sym, children}) => {
  const st = useIn(from, 20);
  return (
    <div
      style={{
        ...st,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 26px",
        borderRadius: 999,
        border: `2.5px solid ${color}`,
        background: "rgba(17,26,46,0.9)",
        fontFamily: SANS,
        fontSize: 36,
        fontWeight: 600,
        color: C.text,
      }}
    >
      <span style={{color, fontSize: 30}}>{sym}</span>
      {children}
    </div>
  );
};

// 3 · Nutrition inside the lights, personal NASA targets
const Nutrition: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const barP = spring({frame: frame - w("nutrition", 3), fps, config: {damping: 20, stiffness: 60}});
  return (
    <AbsoluteFill>
      <Phone
        img={IMG.bone}
        x={PHONE_X}
        y={PHONE_Y}
        h={PHONE_H}
        keys={[{at: 0, r: [0, 0, 780, 1688]}]}
        boxes={[{r: [56, 668, 668, 96], from: w("nutrition", 1), color: C.amber}]}
      />
      <div style={{position: "absolute", left: RIGHT_X, top: 70, fontFamily: SANS, ...useIn(0)}}>
        <Kicker>Nutrition drives the lights</Kicker>
        <div style={{fontSize: 40, fontWeight: 700, color: C.text}}>
          Water + energy → <span style={{color: C.amber}}>Bone</span> · Protein + body mass → <span style={{color: C.amber}}>Muscle</span>
        </div>
      </div>
      <Card img={IMG.bone} r={[50, 662, 690, 106]} w={1000} x={RIGHT_X} y={240} from={w("nutrition", 1)} title="Real screen · Bone detail" />
      <div style={{position: "absolute", left: RIGHT_X, top: 500, width: 1000, fontFamily: SANS, ...useIn(w("nutrition", 3))}}>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 34, fontWeight: 700, color: C.text, marginBottom: 12}}>
          <span>
            Water today <span style={{color: C.amber}}>1690 mL</span>
          </span>
          <span>
            Personal NASA target <span style={{color: C.green}}>2500 mL</span>
          </span>
        </div>
        <div style={{height: 26, borderRadius: 13, background: "#1a2540", overflow: "hidden", boxShadow: `inset 0 0 0 2px ${C.line}`}}>
          <div style={{width: `${(1690 / 2500) * 100 * barP}%`, height: "100%", background: C.amber, borderRadius: 13}} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 24, color: C.dim, marginTop: 18}}>NASA JSC-67378 · fluids = max(32 mL/kg, 2500 mL men / 2100 mL women)</div>
      </div>
    </AbsoluteFill>
  );
};

// 4 · Action levels + source and evidence
const LEVELS = [
  {t: "Notify flight surgeon now", c: C.red},
  {t: "Goes in the weekly report", c: C.accent},
  {t: "Self-care now", c: C.green},
];
const Action: React.FC = () => {
  const {dur} = sceneRange("action");
  return (
    <AbsoluteFill>
      <Phone
        img={IMG.bone}
        x={PHONE_X}
        y={PHONE_Y}
        h={PHONE_H}
        keys={[
          {at: 0, r: [0, 0, 780, 1688]},
          {at: dur, r: [0, 60, 780, 1688]},
        ]}
        boxes={[
          {r: [62, 186, 274, 70], from: w("action", 2), to: w("action", 6), color: C.green},
          {r: [56, 970, 668, 106], from: w("action", 7), color: C.accent},
        ]}
      />
      <div style={{position: "absolute", left: RIGHT_X, top: 70, fontFamily: SANS, ...useIn(0)}}>
        <Kicker>Every status has an action level</Kicker>
      </div>
      <div style={{position: "absolute", left: RIGHT_X, top: 130, display: "flex", flexDirection: "column", gap: 16}}>
        {LEVELS.map((l, i) => (
          <Level key={l.t} from={w("action", 1) + i * 4} active={l.t === "Self-care now" ? w("action", 3) : -1} color={l.c}>
            {l.t}
          </Level>
        ))}
      </div>
      <Card img={IMG.bone} r={[50, 968, 690, 112]} w={1000} x={RIGHT_X} y={520} from={w("action", 7)} title="Every threshold shows source + evidence" />
    </AbsoluteFill>
  );
};

const Level: React.FC<{from: number; active: number; color: string; children: React.ReactNode}> = ({from, active, color, children}) => {
  const frame = useCurrentFrame();
  const st = useIn(from, 20);
  const on = active >= 0 && frame >= active;
  return (
    <div
      style={{
        ...st,
        display: "flex",
        alignItems: "center",
        gap: 18,
        width: 760,
        padding: "16px 26px",
        borderRadius: 16,
        border: `2.5px solid ${on ? color : C.line}`,
        background: on ? "rgba(121,188,58,0.14)" : "rgba(17,26,46,0.9)",
        fontFamily: SANS,
        fontSize: 40,
        fontWeight: 700,
        color: C.text,
        boxShadow: on ? `0 0 26px ${color}` : "none",
      }}
    >
      <span style={{width: 18, height: 18, borderRadius: 9, background: color, display: "inline-block"}} />
      {children}
    </div>
  );
};

// 5 · Weekly report travels with the Mars delay
const Report: React.FC = () => {
  const frame = useCurrentFrame();
  const send = w("report", 9);
  const p = interpolate(frame, [send, send + 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill>
      <Phone
        img={IMG.sent}
        x={PHONE_X}
        y={PHONE_Y}
        h={PHONE_H}
        keys={[{at: 0, r: [0, 0, 780, 1688]}]}
        boxes={[{r: [50, 428, 432, 62], from: w("report", 4), color: C.green}]}
      />
      <div style={{position: "absolute", left: RIGHT_X, top: 70, fontFamily: SANS, ...useIn(0)}}>
        <Kicker>What can wait → weekly report</Kicker>
      </div>
      <Card
        img={IMG.groundFull}
        r={[1130, 1448, 1030, 222]}
        w={1000}
        x={RIGHT_X}
        y={160}
        from={w("report", 2)}
        title="Arrives at Ground"
        boxes={[{r: [1140, 1612, 860, 48], from: w("report", 6), color: C.accent}]}
      />
      <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0}}>
        <path d={`M ${PHONE_X + 400} 520 C 700 520, 700 640, ${RIGHT_X + 10} 640`} stroke={C.accent} strokeWidth={4} fill="none" strokeDasharray="12 12" opacity={0.7 * Math.min(1, p * 3)} />
        {p > 0 && p < 1 ? (
          <circle
            cx={interpolate(p, [0, 1], [PHONE_X + 400, RIGHT_X + 10])}
            cy={interpolate(p, [0, 0.5, 1], [520, 580, 640])}
            r={11}
            fill={C.accent}
          />
        ) : null}
      </svg>
      <Card img={IMG.groundFull} r={[1130, 2826, 1180, 110]} w={1000} x={RIGHT_X} y={600} from={w("report", 10)} title="Real Earth–Mars delay · demo runs 1 min = 1 s" />
    </AbsoluteFill>
  );
};

// 6 · Ground console: crew ranked by severity + live NASA DONKI
const Ground: React.FC = () => {
  const {dur} = sceneRange("ground");
  const W = 1220;
  const H = Math.round((W * 1800) / 2880);
  return (
    <AbsoluteFill>
      <div style={{position: "absolute", left: 70, top: 70, borderRadius: 18, overflow: "hidden", boxShadow: `0 0 0 2px ${C.line}, 0 30px 80px rgba(0,0,0,0.6)`}}>
        <div style={{height: 34, background: "#121a2c", display: "flex", alignItems: "center", gap: 10, paddingLeft: 16}}>
          {[C.red, C.amber, C.green].map((c) => (
            <span key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.8, display: "inline-block"}} />
          ))}
        </div>
        <ShotWrap W={W} H={H} dur={dur} />
      </div>
      <div style={{position: "absolute", left: 1330, top: 110, width: 540, fontFamily: SANS}}>
        <div style={useIn(0)}>
          <Kicker>Ground · flight surgeon</Kicker>
        </div>
        <div style={{fontSize: 50, fontWeight: 800, color: C.text, lineHeight: 1.1, ...useIn(w("ground", 1))}}>
          Crew ranked by <span style={{color: C.amber}}>severity</span>
        </div>
        <div style={{fontSize: 50, fontWeight: 800, color: C.text, lineHeight: 1.1, marginTop: 40, ...useIn(w("ground", 7))}}>
          Live <span style={{color: C.accent}}>NASA DONKI</span> space weather
        </div>
        <div style={{fontSize: 28, color: C.dim, marginTop: 36, lineHeight: 1.35, ...useIn(w("ground", 7) + 10)}}>
          Phone and Ground stay in sync live, and it works offline.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ShotWrap: React.FC<{W: number; H: number; dur: number}> = ({W, H, dur}) => {

  const z1 = w("ground", 1);
  const z2 = w("ground", 6);
  return (
    <Shot
      img={IMG.ground}
      w={W}
      h={H}
      keys={[
        {at: 0, r: [0, 0, 2880, 1800]},
        {at: z1 + 6, r: [380, 330, 1600, 1000]},
        {at: z2, r: [380, 330, 1600, 1000]},
        {at: Math.min(dur, z2 + 24), r: [380, 260, 2120, 1325]},
      ]}
      boxes={[
        {r: [512, 773, 560, 142], from: z1 + 8, to: w("ground", 7), color: C.amber},
        {r: [512, 930, 560, 142], from: z1 + 14, to: w("ground", 7), color: "#f2d13a", dim: false},
        {r: [512, 420, 1856, 262], from: w("ground", 8), color: C.accent},
      ]}
    />
  );
};

// 7 · Close
const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 2, fps, config: {damping: 15, stiffness: 100}});
  return (
    <AbsoluteFill style={{alignItems: "center", fontFamily: SANS}}>
      <div style={{marginTop: 190, display: "flex", alignItems: "center", gap: 34, opacity: p, transform: `scale(${0.9 + 0.1 * p})`}}>
        <svg width={130} height={130} viewBox="-65 -65 130 130">
          <ellipse cx={0} cy={0} rx={60} ry={20} fill="none" stroke="#7fd1ff" strokeWidth={6} transform="rotate(-18)" />
          <circle cx={0} cy={0} r={36} fill={C.accent} />
          <circle cx={-12} cy={-14} r={12} fill={C.green} opacity={0.9} />
        </svg>
        <div style={{fontSize: 104, fontWeight: 800, color: C.text, letterSpacing: -1}}>
          NutriVerso <span style={{color: C.accent}}>Crew Health</span>
        </div>
      </div>
      <div style={{marginTop: 40, fontSize: 58, fontWeight: 700, color: C.text, ...useIn(w("close", 3))}}>
        It guides. <span style={{color: C.amber}}>It does not diagnose.</span>
      </div>
      <div
        style={{
          marginTop: 56,
          padding: "16px 36px",
          borderRadius: 16,
          border: `2.5px solid ${C.accent}`,
          fontFamily: MONO,
          fontSize: 40,
          color: C.text,
          ...useIn(w("close", 1)),
        }}
      >
        sebastianmella1625-dev.github.io/nutriverso
      </div>
      <div style={{marginTop: 30, fontSize: 28, color: C.dim, ...useIn(w("close", 5))}}>
        NASA Space Apps Challenge 2026 · Installable PWA · English / Spanish · Simulated data
      </div>
    </AbsoluteFill>
  );
};

export const NutriVersoMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const appFrom = sceneRange("body").from;
  const appTo = sceneRange("close").from;
  const tagO = interpolate(frame, [appFrom, appFrom + 8, appTo, appTo + 8], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <Scene id="hook">
        <Hook />
      </Scene>
      <Scene id="body">
        <Body />
      </Scene>
      <Scene id="nutrition">
        <Nutrition />
      </Scene>
      <Scene id="action">
        <Action />
      </Scene>
      <Scene id="report">
        <Report />
      </Scene>
      <Scene id="ground">
        <Ground />
      </Scene>
      <Scene id="close">
        <Close />
      </Scene>
      <div style={{opacity: tagO}}>
        <Tag />
      </div>
      <Subtitles />
      {SENTENCES.map((s) => (
        <Sequence key={s.id} from={f(s.start)} durationInFrames={TOTAL_FRAMES - f(s.start)} name={`voz-${s.id}`}>
          <Audio src={staticFile(`voz/${s.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
