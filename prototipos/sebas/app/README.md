# NutriVerso Crew Health (prototype)

Astronaut self-assessment health monitor for the **NASA Space Apps Challenge 2026**, challenge *Create Health Monitoring Software for Astronauts on Space Missions*. Built by team **NutriVerso** (Concepción, Chile).

> ⚠ **Simulated data · Not a diagnostic device.** Crew names belong to team members and every health value is fictional.

## What it does
- **Crew view (phone):** an astronaut-suit body map with 5 systems (Mind, Heart, Bone, Muscle, Immune & metabolic). Each system shows a status with an icon and a text label, not only a color. Tapping a system shows trends, the recommended action, the threshold source and the related NASA HRP hazard.
- **Nutrition inside the status lights:** water and energy intake drive *Bone*; protein and body mass drive *Muscle*.
- **Daily check-in** with a streak and 3 badges. Body mass is requested weekly.
- **Ground view (flight surgeon):** the crew is ranked by severity. An alert banner appears when a crew member notifies Ground or a system becomes critical. Messages carry a **realistic communication delay** (ISS / Moon / Mars 3–22 min; accelerated demo: 1 min = 1 s).
- **Installable PWA** (iOS/Android) with an English/Spanish interface.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173  (#/crew and #/ground)
npm test           # 106 unit tests (domain, data, i18n)
npm run build && npm run preview
```

### Live rooms with Supabase (optional)
1. Create a Supabase project and run `../supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and paste the project URL and the **anon** key.
3. Generate and run a room seed: `npm run seed -- demo`, then paste `../supabase/seed-demo.sql` into the SQL Editor.
4. Open the app with `?room=demo`. Without a room the app runs in local demo mode.

## Data sources
- NASA Human Research Program: [5 Hazards](https://www.nasa.gov/hrp/hazards/) and [Risks](https://www.nasa.gov/hrp/risks/).
- Clinical thresholds: AHA/ACC 2017, ADA Standards of Care 2026, AASM/SRS, GLIM 2019, NASA ISS nutritional requirements. Sources marked ⚠ in the app are pending verification.

## Use of AI (Space Apps "Super Intelligence" disclosure)
This prototype was built with **Claude Code (Anthropic)**, which wrote the source code, the tests and the draft health-action texts. The team set the requirements and made the design and clinical decisions (see `../../sdd/decisiones.md`). The nutrition team must still review the action texts. The icons were drawn by code; there are no AI-generated images.
