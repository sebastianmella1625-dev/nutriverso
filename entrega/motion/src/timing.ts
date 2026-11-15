// Timeline driven by the real voice clips (src/voz.json, written by voz/generar.py).
// Every sentence gets a slot = its last spoken word + a short gap, so scenes stretch
// or shrink with the voice. Edit voz/guion.json, rerun the generator, re-render.
import voz from "./voz.json";

export const FPS = 30;
export const LEAD = 0.15; // silence before the first sentence (s)
export const GAP = 0.18; // pause added after each sentence (each mp3 also starts with ~0.1 s of silence)
export const TAIL = 0.75; // hold after the last word (s)

export type Word = {w: string; s: number; e: number};
export type Sentence = {
  id: string;
  texto: string;
  dur: number;
  words: Word[];
  start: number; // absolute start of the mp3 (s)
  end: number; // absolute end of the slot (s)
};

const raw = voz.frases as {id: string; texto: string; dur: number; words: Word[]}[];

let t = LEAD;
export const SENTENCES: Sentence[] = raw.map((f, i) => {
  const last = f.words[f.words.length - 1].e;
  const slot = last + (i === raw.length - 1 ? TAIL : GAP);
  const s = {...f, start: t, end: t + slot};
  t += slot;
  return s;
});

export const TOTAL_SECONDS = t;
export const TOTAL_FRAMES = Math.floor(TOTAL_SECONDS * FPS);

export const byId = (id: string) => {
  const s = SENTENCES.find((x) => x.id === id);
  if (!s) throw new Error(`no sentence ${id}`);
  return s;
};

export const f = (seconds: number) => Math.round(seconds * FPS);

// Absolute time (s) when word number `n` of sentence `id` starts.
export const wordAt = (id: string, n: number) => {
  const s = byId(id);
  return s.start + s.words[Math.min(n, s.words.length - 1)].s;
};

// Scene boundaries in frames: visuals arrive a few frames ahead of the voice.
export const LEADIN = 4;
export const sceneRange = (id: string) => {
  const i = SENTENCES.findIndex((x) => x.id === id);
  const s = SENTENCES[i];
  const from = i === 0 ? 0 : f(s.start) - LEADIN;
  const next = SENTENCES[i + 1];
  const to = next ? f(next.start) - LEADIN : TOTAL_FRAMES;
  return {from, dur: to - from};
};
