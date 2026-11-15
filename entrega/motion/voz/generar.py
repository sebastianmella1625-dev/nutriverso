"""Generates the English voice-over with Edge TTS: one mp3 per sentence in
public/voz/, plus src/voz.json with each sentence's duration and word timings.

Usage (from entrega/motion):  python -I voz/generar.py
Needs edge-tts >= 7.3.1  (pip install -U edge-tts  if the service answers 403).
"""
import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = json.loads((ROOT / "voz" / "guion.json").read_text(encoding="utf-8"))
OUT = ROOT / "public" / "voz"

# Edge TTS returns 24 kHz mono mp3 at a constant 48 kbit/s,
# so the duration comes straight from the file size.
BITS_PER_SECOND = 48_000


async def one(voice: str, rate: str, sentence: dict) -> dict:
    dest = OUT / f"{sentence['id']}.mp3"
    comm = edge_tts.Communicate(sentence["texto"], voice, rate=rate, boundary="WordBoundary")
    audio = bytearray()
    words = []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            # offsets come in 100 ns ticks
            start = chunk["offset"] / 1e7
            words.append({"w": chunk["text"], "s": round(start, 3), "e": round(start + chunk["duration"] / 1e7, 3)})
    dest.write_bytes(bytes(audio))
    seconds = len(audio) * 8 / BITS_PER_SECOND
    return {"id": sentence["id"], "texto": sentence["texto"], "dur": round(seconds, 3), "words": words}


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    voice, rate = SCRIPT["voz"], SCRIPT["velocidad"]
    result = []
    for s in SCRIPT["frases"]:
        for attempt in range(4):  # the service sometimes drops a request
            try:
                r = await one(voice, rate, s)
                break
            except edge_tts.exceptions.NoAudioReceived:
                if attempt == 3:
                    raise
                await asyncio.sleep(2)
        print(f"{r['id']:10} {r['dur']:5.2f} s  {len(r['words'])} words")
        result.append(r)
    (ROOT / "src" / "voz.json").write_text(json.dumps({"voz": voice, "frases": result}, indent=1), encoding="utf-8")
    print(f"total voice {sum(r['dur'] for r in result):5.2f} s")


asyncio.run(main())
