# NutriVerso · Crew Health

**NASA Space Apps Challenge 2026** · Challenge: *Create Health Monitoring Software for Astronauts on Space Missions* · Team **NutriVerso** (Concepción, Chile).

🚀 **Live app:** https://sebastianmella1625-dev.github.io/nutriverso/ (open `#/crew` on a phone and `#/ground` on a computer)

> ⚠ Simulated data · Not a diagnostic device.

An installable web app (PWA, English/Spanish) that lets astronauts **self-assess their health** and act on it:
- A body map with 5 systems. **Nutrition sits inside the status lights**: hydration and energy drive *Bone*, protein and body mass drive *Muscle*.
- Every status says what to do and **when to involve the flight surgeon**.
- A **Ground console** sees the crew live and answers with the **real Earth–Mars communication delay**.

## Repository map
| Path | What it is |
|---|---|
| `final/app/` | The final app (Vite + React + TypeScript). See its README to run it. |
| `final/supabase/` | Database schema and room seed generator for live multi-device mode |
| `prototipos/sebas/` | Sebastián's prototype (the base of the final app, tag `proto-sebas-v1`) |
| `sdd/` | Spec-driven development: constitution, decisions log, specs and plans |
| `debate/` | Comparison of the team's three prototypes |

## Use of AI
Built with **Claude Code (Anthropic)**. It wrote the code, the tests and the draft health texts. The team set the requirements and made every design and clinical decision (`sdd/decisiones.md`). Details are in `final/app/README.md`.
