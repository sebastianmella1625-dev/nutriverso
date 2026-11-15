#!/usr/bin/env bash
# Renders the motion demo and writes ../video/nutriverso-motion-30s.mp4
# Step 1: Remotion render (single pass; system fonts, so no font delayRender).
# Step 2: re-encode to standard yuv420p (tv range) + loudness-normalised AAC, cut to the video length.
# Usage (from entrega/motion):  bash tools/render.sh      (after editing voz/guion.json run: python -I voz/generar.py)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
npx tsc --noEmit
npx remotion render src/index.ts NutriVersoMotion out/remotion-raw.mp4 --codec=h264 --audio-codec=aac --crf=18 --timeout=120000 --log=error
DUR=$(node -e "const v=require('./src/voz.json');let t=0.15;v.frases.forEach((f,i)=>{t+=f.words.at(-1).e+(i===v.frases.length-1?0.75:0.18)});console.log((Math.floor(t*30)/30).toFixed(3))")
FF=$(command -v ffmpeg || echo "npx remotion ffmpeg")
$FF -v error -y -i out/remotion-raw.mp4 -t "$DUR" -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -movflags +faststart \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k ../video/nutriverso-motion-30s.mp4
echo "done: ../video/nutriverso-motion-30s.mp4 ($DUR s)"
