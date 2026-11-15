# Project page: texto listo para copiar (NASA Space Apps 2026)

> Cada bloque corresponde a un campo del formulario "Project" del equipo en spaceappschallenge.org. Todo va en inglés, como exigen las bases. Los `[[…]]` se completan cuando existan los links de la demo.

---

## Project Name
NutriVerso Crew Health

## High-Level Project Summary
NutriVerso Crew Health is an installable web app (PWA, English/Spanish) that helps astronauts on long missions assess their own health and know what to do about it. A body map shows five systems (mind, heart, bone, muscle, immune and metabolic) with a clear status. We put nutrition inside those status lights: hydration and energy intake drive *Bone* and protein and body mass drive *Muscle*, each compared with NASA's personalized targets (JSC-67378). Every status comes with an action level: "Notify flight surgeon now", "Goes in the weekly report" or "Self-care now". A Ground console lets the flight surgeon follow the crew live, and every message travels with the real Earth–Mars delay. We built it because at Mars distance, help is 3 to 22 minutes away and astronauts must be able to judge their own health.

## Link to Project Demo
[[link público a las 7 slides de Canva]]
(Video de 30 s, si se elige: [[link de YouTube o Drive]])

## Link to Final Project
- Live app: https://sebastianmella1625-dev.github.io/nutriverso/ (astronaut view: `#/crew`, flight surgeon view: `#/ground`)
- Source code: https://github.com/sebastianmella1625-dev/nutriverso

## Detailed Project Description
**What it does**
- **Self-assessment the challenge asks for.** The astronaut logs the challenge's six indicators (heart rate, blood pressure, glucose, temperature, sleep, mood) plus water, energy, protein and body mass in a 3-step daily check-in. The app rejects impossible values and accepts decimal commas.
- **Body map with five systems.** Each system takes its worst indicator. Readings expire (36 h; body mass 8 days), and "no data" is never shown as "OK". Every status uses an icon and a text label, not only a color.
- **Nutrition with NASA targets.** Energy is compared with the NASA JSC-67378 requirement (IOM 2005 EER + 200 kcal per EVA hour, 3-day average). Fluids are compared with max(32 mL/kg, 2500 mL men / 2100 mL women). Body-mass loss uses NASA's 3.3 % and 5 % cut-offs. The app shows each target next to the value.
- **When to involve Earth.** Each status has an action level. Critical vital signs mean "Notify flight surgeon now". Slow problems such as mass loss or low intake "Go in the weekly report". Everything else is "Self-care now", with a concrete action and the reason behind it.
- **Sources and evidence levels.** Every threshold shows its source and evidence level (strong, moderate or team-defined).
- **Weekly flight-surgeon report.** It summarizes 7 days: averages against NASA targets, days in alert and urgent items. It travels to Ground with the communication delay.
- **Ground console.** The crew is ranked by severity. An alert banner appears when a crew member notifies Ground or a system turns critical. Messages travel with ISS, Moon or Mars delay (3–22 min; an accelerated demo mode compresses minutes into seconds).
- **Live NASA space weather (DONKI).** The card shows solar particle events, CMEs, flares and storms from the last 7 days. A solar particle event triggers shelter guidance. Data is cached, so the card works offline.
- **Engagement.** Check-in streak and badges (first week, hydration on target, 7 h+ sleep).

**How it works**
- React + TypeScript progressive web app. All clinical logic lives in a framework-free domain layer covered by 161 unit tests, including boundary values for every threshold.
- Live rooms sync the astronaut's phone and the Ground computer through Supabase Realtime (Postgres with row-level security). Without a room, the app runs fully offline in a local demo mode.
- All data is simulated: a seeded 30-day Mars-transit mission with two fictional crew members.

**Why it matters / what we hope to achieve**
NASA lists inadequate nutrition among the risks of long-duration missions, and crews on the ISS typically eat less than they need. NutriVerso turns the astronaut's daily data into clear, sourced actions. It also tells the astronaut which problems can wait for the weekly report and which need the flight surgeon now: the autonomy a Mars crew will need. The tool guides; it does not diagnose.

**Tools**
TypeScript, React 19, Vite, vite-plugin-pwa, Recharts, Vitest, Supabase (Postgres + Realtime), GitHub Pages and GitHub Actions, NASA DONKI API.

## Use of Super Intelligence (AI)
Yes. We used **Claude (Anthropic) through Claude Code** to write the source code, the unit tests and the first drafts of the health-action texts. The team (Nutrition & Dietetics students) set the requirements and made every design and clinical decision; 57 decisions are logged in `sdd/decisiones.md` in the repository. Our teammates' prototypes, built with Claude and ChatGPT, were reviewed and their best ideas were rebuilt in this codebase with tests. The repository README declares the AI use. We used no AI-generated images: the app icons are drawn by code and every screenshot comes from the real app.

## NASA Data
- **NASA Human Research Program**: 5 Hazards of Human Spaceflight and Human System Risks. Each body system links to its hazard (isolation, altered gravity, hostile closed environment and radiation).
- **NASA JSC-67378 (2020)**, *Nutritional Requirements for Exploration Missions up to 365 days*: energy equation, EVA allowance, fluid and protein targets.
- **NASA Food and Nutrition Risk (Human System Risk Board, Rev D, 2025)**: body-mass loss cut-offs (3.3 %, 5 %).
- **NASA DONKI (Space Weather Database Of Notifications, Knowledge, Information)** through api.nasa.gov: live space weather notifications.

## Space Agency Partner Data and Other References
- Canadian Space Agency, *Monitoring Radiation for Astronaut Health* (context for the space weather card).
- American Heart Association / ACC 2017 hypertension guideline (blood pressure); AHA resting heart rate range.
- American Diabetes Association, *Standards of Care in Diabetes 2026* (glucose).
- AASM/SRS consensus on adult sleep duration (≥ 7 h).
- Institute of Medicine (2005), Dietary Reference Intakes (EER equation used by NASA).
- Open-source tools: React, Vite, Recharts, Supabase JS, vite-plugin-pwa (MIT/Apache licenses).
