# Prototipo Sebas "Sistemas + nutrición": plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** una PWA bilingüe en la que el astronauta (Crew) ve 5 sistemas corporales con semáforo, registra un check-in diario y recibe mensajes de Ground con retardo, mientras Ground ve a la tripulación en vivo.

**Architecture:** el dominio es TypeScript puro en `src/domain` y se prueba con Vitest: umbrales, clasificación, sistemas, retardo y misión simulada. Una interfaz `Store` con dos implementaciones, mock (BroadcastChannel y localStorage) y supabase, separa los datos de la UI. La UI React usa hash routing (`#/crew` y `#/ground`) para que funcione en GitHub Pages.

**Tech Stack:** Vite + React 19 + TypeScript, vite-plugin-pwa, Recharts, @supabase/supabase-js y Vitest.

**Spec:** `sdd/spec-sebas.md` (y `sdd/brief-prototipos.md` §3 para el contrato de datos).

## Global Constraints
- Raíz del proyecto: `prototipos/sebas/app/`. Todos los paths de abajo son relativos a esa raíz.
- Indicadores (ni más ni menos): `heart_rate, bp_systolic, bp_diastolic, glucose, body_temp, sleep_hours, mood, water_ml, energy_kcal, protein_g, body_mass_kg`.
- Estados: `ok | watch | alert | critical | nodata`. El color nunca es la única señal (ícono y texto i18n).
- Ningún texto de UI escrito directo en los componentes: todo pasa por `t('key')`. Idioma por defecto `en`.
- Datos 100 % simulados. La UI muestra el aviso "Simulated data".
- Claves solo en `.env.local` (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`). Si faltan, se usa el store mock.
- Commits sin Co-Authored-By. Si `git config user.name` está vacío, el commit se salta y se anota en `sdd/harness.md`.

## Review Focus
1. **Valor justo en el borde de un umbral** (120 mmHg, 70 mg/dL, 7 h): cae en el tramo que dice la tabla del spec. Lo cubren los tests de borde de la Task 2.
2. **Un sistema sin lecturas:** muestra `nodata`, no `ok`. Un astronauta que no se midió no está "bien". Task 3, `test_system_without_readings_is_nodata`.
3. **Entrada imposible o con coma decimal en el check-in** (`"36,8"`, frecuencia 0, temperatura 368): la coma se acepta y lo implausible se rechaza con un mensaje. Task 2, `parseValue` y `validateReading`.
4. **Mensaje con `deliver_at` en el futuro:** no se muestra su cuerpo hasta que llega, solo "en tránsito". Task 4, `isDelivered`.
5. **Sin variables de Supabase o con URL inválida:** la app arranca con el mock y no queda una pantalla en blanco. Task 6, `createStore`.

---

### Task 1: Scaffold PWA + shell

**Files:** proyecto Vite `react-ts` en `prototipos/sebas/app/`. Crear `vite.config.ts` (PWA más `base: './'`), `src/main.tsx`, `src/App.tsx` (router por hash), `src/ui/tokens.css`, `public/icon-192.png` y `public/icon-512.png` (íconos simples, sin logo de NASA).

**Interfaces:**
- Produce: `App` con rutas `#/crew` (por defecto) y `#/ground`. Los tokens CSS van en `:root` (`--bg`, `--surface`, `--text`, `--ok`, `--watch`, `--alert`, `--critical`, `--nodata`), con estética oscura de mission control y contraste AA.

- [ ] Paso 1: `npm create vite@latest app -- --template react-ts` dentro de `prototipos/sebas/`, y `npm i recharts @supabase/supabase-js` y `npm i -D vite-plugin-pwa vitest`.
- [ ] Paso 2: configurar el manifest PWA. name "NutriVerso Crew Health", short_name "NutriVerso", `display: standalone`, `theme_color` igual a `--bg`, `registerType: autoUpdate`.
- [ ] Paso 3: agregar el script `"test": "vitest run"` y crear `src/domain/smoke.test.ts` con `expect(1).toBe(1)`.
- [ ] Paso 4: correr `npm run test && npm run build`. Esperado: los tests pasan y se genera `dist/` con `manifest.webmanifest` y `sw.js`.
- [ ] Paso 5: commit `chore: scaffold PWA prototype`.

### Task 2: Umbrales, clasificación y validación

**Files:** crear `src/domain/types.ts`, `src/domain/thresholds.ts` y `src/domain/thresholds.test.ts`.

**Interfaces:**
- Produce:
  - `type Indicator`, `type Status`, `interface Reading { id; crew_id; indicator: Indicator; value: number; unit: string; measured_at: string; source: string }`
  - `interface CrewProfile { crew_id; name; energyGoalKcal: number; baselineMassKg: number }`
  - `classify(ind: Indicator, value: number, profile: CrewProfile): Status`
  - `parseValue(raw: string): number | null`
  - `validateReading(ind: Indicator, value: number): { ok: true } | { ok: false; reason: string }`, donde `reason` es una clave i18n
  - `UNITS: Record<Indicator,string>`
  - `SOURCES: Record<Indicator,string>`
- La presión se clasifica por separado (sistólica y diastólica) con los tramos de la tabla del spec. energy_kcal se compara como % de `energyGoalKcal`. protein_g usa g/kg calculado sobre `baselineMassKg`. body_mass_kg usa el % de pérdida respecto de `baselineMassKg`.

- [ ] Paso 1: tests de borde con los valores exactos del spec:
  - `classify('bp_systolic',119)=ok`, `120=watch`, `130=alert`, `140=critical`
  - `classify('bp_diastolic',79)=ok`, `80=alert`, `90=critical`
  - `glucose`: `70=ok`, `99=ok`, `100=watch`, `126=alert`, `69=alert`, `53=critical`
  - `sleep_hours`: `7=ok`, `6.9=watch`, `5=alert`, `4.9=critical`
  - `body_temp`: `37.2=ok`, `38=alert`, `39.5=critical`, `34.9=critical`
  - `mood`: `5=ok`, `3=watch`, `1=critical`
  - `water_ml`: `2000=ok`, `999=critical`
  - con perfil {energyGoalKcal 2800, baselineMassKg 75}: `energy_kcal 2520=ok`, `1950=critical`; `protein_g 90=ok` (1,2 g/kg), `59=critical`; `body_mass_kg 75=ok`, `71.25=alert` (−5 %), `67.5=critical`
  - `heart_rate`: `60=ok`, `100=ok`, `101=watch`, `39=critical`
- [ ] Paso 2: tests de entrada:
  - `parseValue('36,8')=36.8`, `parseValue('abc')=null`
  - `validateReading('heart_rate',0).ok=false`, `validateReading('body_temp',368).ok=false`, `validateReading('body_temp',36.8).ok=true`
  - Rangos plausibles: HR 20–250, PAS 50–260, PAD 30–160, glucosa 20–600, temperatura 30–43, sueño 0–24, ánimo 1–5, agua 0–8000, energía 0–8000, proteína 0–400, masa 30–200.
- [ ] Paso 3: implementar en `thresholds.ts`. `SOURCES` copia la columna Fuente del spec, incluida la marca ⚠.
- [ ] Paso 4: `npm run test`. Esperado: todo pasa.
- [ ] Paso 5: commit `feat(domain): thresholds and validation`.

### Task 3: Sistemas, estado agregado y acciones

**Files:** crear `src/domain/systems.ts` y `src/domain/systems.test.ts`.

**Interfaces:**
- Consume: `classify`, `Reading`, `CrewProfile`, `Status`.
- Produce:
  - `type SystemId = 'mind'|'heart'|'bone'|'muscle'|'immune'`
  - `SYSTEMS: Record<SystemId,{ indicators: Indicator[]; hazardKey: string; hazardUrl: string }>`, con el mapa de la tabla del spec. Los hazardUrl apuntan a nasa.gov/hrp/hazards/ o /risks/.
  - `latestByIndicator(readings: Reading[], crewId: string): Partial<Record<Indicator,Reading>>`
  - `systemStatus(sys: SystemId, latest, profile): Status`: el peor estado de los indicadores; `nodata` si falta alguno.
  - `crewSeverity(readings, profile): { worst: Status; bySystem: Record<SystemId,Status> }`
  - `actionKey(sys, status): string`: clave i18n `action.<sys>.<status>`.
  - `SEVERITY_ORDER: Status[]` = critical > alert > watch > nodata > ok.
- [ ] Paso 1: tests:
  - `test_system_without_readings_is_nodata`
  - un sistema con uno `ok` y uno `alert` da `alert`
  - `latestByIndicator` elige el `measured_at` más reciente
  - el orden de `crewSeverity` respeta `SEVERITY_ORDER`
- [ ] Paso 2: implementar. Paso 3: tests en verde. Paso 4: commit `feat(domain): body systems`.

### Task 4: Retardo de comunicación y misión simulada

**Files:** crear `src/domain/delay.ts`, `src/domain/mission.ts` y `src/domain/delay.test.ts`, `src/domain/mission.test.ts`.

**Interfaces:**
- Produce:
  - `type Scenario = 'iss'|'moon'|'mars'`
  - `delaySeconds(s: Scenario, opts: { accelerated: boolean; marsMinutes?: number }): number`. Valores: iss 0, moon 1.3, mars `marsMinutes*60` (por defecto 12, limitado a 3–22). Con `accelerated`, mars pasa a `marsMinutes` segundos.
  - `isDelivered(msg: { deliver_at: string|null }, now: Date): boolean`
  - `CREW: CrewProfile[]`: crew-01 "Commander A. Rivera" (2800 kcal, 75 kg) y crew-02 "Specialist M. Chen" (2300 kcal, 62 kg)
  - `generateMission(seed: number, days = 30, end = new Date()): Reading[]`: determinista y con un PRNG con semilla (mulberry32).
- [ ] Paso 1: tests:
  - `delaySeconds('mars',{accelerated:false,marsMinutes:30})=1320` (limitado a 22 min)
  - `delaySeconds('mars',{accelerated:true,marsMinutes:12})=12`
  - `isDelivered({deliver_at:null},now)=true`; un deliver_at en el futuro da false
  - con `end` fijo (`new Date('2026-11-14T12:00:00Z')`), `generateMission(42, 30, end)` produce dos veces el mismo resultado; 30 días × 2 tripulantes × 11 indicadores = 660 lecturas
  - en el último día, crew-01 tiene `bone` y `muscle` en alerta o crítico (agua <1500 y masa −5 % o más); crew-02 tiene `mind` en vigilar o peor (sueño <7) y `heart` en ok
- [ ] Paso 2: implementar. Paso 3: tests en verde. Paso 4: commit `feat(domain): delay and simulated mission`.

### Task 5: i18n EN/ES

**Files:** crear `src/i18n/en.ts`, `src/i18n/es.ts`, `src/i18n/index.tsx` y `src/i18n/i18n.test.ts`.

**Interfaces:**
- Produce: `I18nProvider`, `useT(): { t(key: string, vars?: Record<string,string|number>): string; lang: 'en'|'es'; setLang(l) }`. El idioma se guarda en localStorage dentro de try/catch. Las claves incluyen `status.*`, `system.*`, `indicator.*`, `action.<sys>.<status>`, `hazard.*` y `validation.*`.
- [ ] Paso 1: test de paridad: `Object.keys(en)` es igual a `Object.keys(es)`, y existe `action.<sys>.<status>` para los 5 sistemas × 5 estados.
- [ ] Paso 2: escribir los diccionarios. Las acciones son concretas, por ejemplo "Drink 500 mL now; target ≥2 L/day". Cada `critical` incluye "Notify Ground flight surgeon".
- [ ] Paso 3: tests en verde. Paso 4: commit `feat: i18n en/es`.

### Task 6: Store (mock + supabase)

**Files:** crear `src/data/store.ts`, `src/data/mockStore.ts`, `src/data/supabaseStore.ts`, `src/data/index.ts` y `src/data/mockStore.test.ts`.

**Interfaces:**
- Produce:
  - `interface Message { id; crew_id; from_role: 'crew'|'ground'; body; created_at; deliver_at: string|null }`
  - `interface Store { readings(): Promise<Reading[]>; addReadings(r: Omit<Reading,'id'>[]): Promise<void>; messages(): Promise<Message[]>; sendMessage(m: Omit<Message,'id'|'created_at'>): Promise<void>; subscribe(cb: () => void): () => void; kind: 'mock'|'supabase' }`
  - `createStore(env): Store`: devuelve supabase solo si las dos variables existen y la URL empieza con `https://`. Si no, o si falla la creación, devuelve mock.
- Mock: guarda en localStorage (`nv.readings` y `nv.messages`), siembra `generateMission(42)` si está vacío y avisa a las otras pestañas por BroadcastChannel `nv-sync`. Supabase: selects e inserts sobre las tablas del contrato y un canal `postgres_changes` para las dos tablas.
- [ ] Paso 1: tests del mock en jsdom, con BroadcastChannel stub:
  - la primera carga siembra 660 lecturas
  - después de `addReadings`, `readings()` las incluye
  - `subscribe` se dispara después de `sendMessage`
  - `createStore({})` da `kind === 'mock'`
  - `createStore({VITE_SUPABASE_URL:'nope',VITE_SUPABASE_ANON_KEY:'x'})` da `kind === 'mock'`
- [ ] Paso 2: implementar. Paso 3: tests en verde. Paso 4: commit `feat(data): mock and supabase stores`.

### Task 7: Vista Crew

**Files:** crear `src/ui/crew/CrewView.tsx`, `BodyMap.tsx`, `SystemDetail.tsx`, `CheckIn.tsx`, `Inbox.tsx` y `src/ui/StatusBadge.tsx`.

**Interfaces:**
- Consume: `Store`, `crewSeverity`, `SYSTEMS`, `classify`, `validateReading`, `parseValue`, `isDelivered` y `useT`.
- Detalle de cada pieza:
  - Selector de tripulante: crew-01 por defecto.
  - `BodyMap`: SVG de silueta con 5 zonas clicables (cabeza = mente, pecho = corazón, piernas = hueso, brazos = músculo, abdomen = inmune). Cada zona es un `<button>` accesible con `aria-label` que dice el sistema y su estado.
  - `SystemDetail`: indicadores con su último valor y `StatusBadge`; un LineChart de Recharts de 30 días por indicador; el peligro con link; el texto `actionKey`; y el botón "Notify Ground" si el estado es alert o critical (envía un mensaje `from_role:'crew'`).
  - `CheckIn`: 11 campos en 3 pasos (vitales, sueño y ánimo, nutrición). Valida con `validateReading` y muestra el error de i18n en línea. Al guardar llama a `addReadings`. La racha se calcula con días consecutivos con check-in.
  - `Inbox`: los mensajes de ground; si `!isDelivered`, muestra "In transit · arrives in Xs" con una cuenta regresiva.
- Encabezado: toggle EN/ES, aviso "Simulated data · Not a diagnostic device" y link "Source: NASA HRP".
- [ ] Paso 1: implementar. Paso 2: `npm run build` sin errores de TypeScript. Paso 3: commit `feat(ui): crew view`.

### Task 8: Vista Ground

**Files:** crear `src/ui/ground/GroundView.tsx`, `CrewList.tsx`, `CrewDetail.tsx` y `MessageComposer.tsx`.

**Interfaces:**
- Consume: lo mismo que Task 7, más `delaySeconds` y `SEVERITY_ORDER`.
- `CrewList`: los tripulantes ordenados por `crewSeverity().worst`, con el peor sistema nombrado. `CrewDetail`: los 5 sistemas con badge y la tendencia del sistema seleccionado. `MessageComposer`: texto, escenario (iss, moon o mars), deslizador de minutos para Marte (3–22) y toggle "Accelerated demo". El `deliver_at` se calcula como `now + delaySeconds`. Se actualiza en vivo con `subscribe`.
- [ ] Paso 1: implementar. Paso 2: `npm run build`. Paso 3: commit `feat(ui): ground view`.

### Task 9: Verificación extremo a extremo

- [ ] Paso 1: `npm run test && npm run build && npm run preview`.
- [ ] Paso 2: en el navegador, abrir `#/crew` y `#/ground` en dos pestañas y comprobar:
  - un check-in en Crew aparece en Ground sin recargar;
  - un mensaje con Marte acelerado de 5 s se ve "en tránsito" y llega a los 5 s;
  - en el último día, crew-01 muestra hueso y músculo en alerta.
- [ ] Paso 3: viewport móvil de 375 px sin scroll horizontal. El cambio EN/ES traduce todo y no quedan claves crudas en pantalla.
- [ ] Paso 4: en Lighthouse o en DevTools Application, el manifest y el service worker son válidos y la app es instalable.
- [ ] Paso 5: actualizar `sdd/harness.md` y llenar `prototipos/sebas/ENTREGA.md` desde la plantilla, con 3 capturas.
