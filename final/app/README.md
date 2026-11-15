# NutriVerso Crew Health (prototype)

Astronaut self-assessment health monitor for the **NASA Space Apps Challenge 2026**, challenge *Create Health Monitoring Software for Astronauts on Space Missions*. Built by team **NutriVerso** (Concepción, Chile).

> ⚠ **Simulated data · Not a diagnostic device.** Crew names belong to team members and every health value is fictional.

## What it does
- **Crew view (phone):** an astronaut-suit body map with 5 systems (Mind, Heart, Bone, Muscle, Immune & metabolic). Each status shows an icon and a text label, not only a color.
- **Nutrition inside the status lights, with NASA targets:**
  - energy is compared with the **NASA JSC-67378 requirement** (IOM 2005 EER, +200 kcal per EVA hour; 3-day average);
  - fluids with **max(32 mL/kg, 2500 mL men / 2100 mL women)**;
  - body-mass loss with NASA's **3.3 % / 5 %** cut-offs.
- **When to involve Earth:** every status has an action level, **Notify flight surgeon now**, **Goes in the weekly report** or **Self-care now**. Every threshold shows its source and **evidence level**.
- **Weekly flight-surgeon report:** the astronaut sends a 7-day summary (in English) that travels with the Mars delay.
- **Live NASA data:** a space weather card from **NASA DONKI** (solar particle events trigger shelter guidance), cached for offline use.
- **Ground console (flight surgeon):** the crew is ranked by severity. Alerts appear when a crew member notifies Ground or a system turns critical. Messages carry a **realistic communication delay** (ISS / Moon / Mars 3–22 min; accelerated demo: 1 min = 1 s).
- **Live rooms** (`?room=name`) sync phone and computer through Supabase Realtime. Without a room the app runs offline in local demo mode.
- **Installable PWA** (iOS/Android), English/Spanish. Daily check-in with a streak and badges.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173  (#/crew and #/ground)
npm test           # 161 unit tests (domain, data, i18n)
npm run stress     # load test: 5,000 readings + 300 messages
npm run build && npm run preview
```

### Live rooms with Supabase (optional)
1. Create a Supabase project and run `../supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and paste the project URL and the **anon** key.
3. Optionally add a free NASA API key (`VITE_NASA_API_KEY`, from api.nasa.gov); without it the app uses `DEMO_KEY`.
4. Generate and run a room seed: `npm run seed -- demo`, then paste `../supabase/seed-demo.sql` into the SQL Editor.
5. Open the app with `?room=demo`. Without a room the app runs in local demo mode.

## Data sources
- NASA Human Research Program: [5 Hazards](https://www.nasa.gov/hrp/hazards/) and [Risks](https://www.nasa.gov/hrp/risks/).
- NASA JSC-67378 (2020) nutritional requirements and NASA Food and Nutrition Risk Rev D (2025): energy, fluids, protein, body mass.
- NASA DONKI (api.nasa.gov) for live space weather.
- Clinical thresholds for vital signs: AHA/ACC 2017, ADA Standards of Care 2026, AASM/SRS. Cut-offs set by the team are labelled as such in the app.

## Use of AI (Space Apps "Super Intelligence" disclosure)
This prototype was built with **Claude Code (Anthropic)**, which wrote the source code, the tests and the draft health-action texts. The team set the requirements and made every design and clinical decision (60 decisions logged in `../../sdd/decisiones.md`). The nutrition team reviewed and approved the action texts and the team-defined cut-offs. Ideas from the teammates' prototypes (Miguel: action levels, NASA targets, report, DONKI; Camila: muscle protocol rigor) were rebuilt in this codebase with tests. The icons were drawn by code; there are no AI-generated images.
