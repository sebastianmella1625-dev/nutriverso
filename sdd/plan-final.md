# Prototipo final: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (native, una tarea a la vez, con las decisiones de Sebas antes de cada una). Steps use checkbox (`- [ ]`) syntax.

**Goal:** sumar a la base de Sebas las metas NASA, los niveles de acción, el informe para el médico y el clima espacial NASA, y dejarla blindada para una demo en vivo celular ↔ computador.
**Architecture:** igual que la base. Todo lo nuevo de dominio va como TypeScript puro en `src/domain/` con tests de Vitest; la UI solo lo consume.
**Tech Stack:** Vite + React 19 + TS, vite-plugin-pwa, Recharts, Supabase JS, Vitest.
**Spec:** `sdd/spec-final.md` (+ `sdd/spec-sebas.md`).

## Global Constraints
- Raíz: `final/app/`. Commits sin Co-Authored-By.
- Ningún texto de UI escrito directo en los componentes; EN y ES siempre a la par (lo garantiza el test de paridad).
- Cada número clínico nuevo lleva su fuente y su nivel de evidencia.
- El juzgamiento local **congela funciones el domingo a las 15:00**. Después de esa hora solo se corrigen errores y se ensaya.

## Review Focus
1. Sin red en la sede: DONKI muestra el último dato guardado o "sin datos aún", nunca una pantalla rota.
2. Límite de DEMO_KEY alcanzado (error 429): se trata igual que sin red.
3. Un perfil sin sexo, edad o estatura: no se calcula el EER y la energía queda `nodata` con aviso (no se inventa una meta).
4. Informe sin lecturas en 7 días: se envía igual, diciendo "sin registros", sin división por cero.
5. Una recarga a mitad de la demo: Ground no vuelve a mostrar avisos ya abiertos.

---

### F1: base final + publicación
- [ ] Tag `proto-sebas-v1`. Copiar `prototipos/sebas/app` a `final/app` (sin node_modules ni dist), `npm ci`, tests verdes.
- [ ] Workflow de GitHub Actions que construye `final/app` y publica `dist` en GitHub Pages.
- [ ] Con el OK de Sebas: `gh repo create` (público), push, activar Pages. Verificar que el link abra sin login.

### F2: metas NASA (dominio, TDD)
**Interfaces:**
- `CrewProfile` suma `sex: 'm'|'f'`, `age`, `heightM` y `activity: 'high'|'low'`.
- `eer(p, massKg): number`
- `energyTarget(p, massKg, evaHoursAvg): number`
- `fluidTarget(p, massKg): number`
- `classify` usa estas metas para `energy_kcal`, `water_ml` y `body_mass_kg`.
- [ ] Tests con valores calculados a mano. Ejemplo: hombre, 40 años, 75 kg, 1,78 m, PA 1,25 → EER = 662 − 381,2 + 1,25·(1192,5 + 960,49) = **2972,0** kcal.
- [ ] Cortes según D-40 (los decide Sebas antes de la tarea).
- [ ] Actualizar la misión simulada para que la historia de Miguel y Camila se mantenga.

### F3: niveles de acción + evidencia (dominio + UI)
- [ ] `actionLevel(ind, status): 'now'|'report'|'self'|null` con los conjuntos de Miguel, adaptados a nuestros indicadores.
- [ ] `EVIDENCE: Record<Indicator,'strong'|'moderate'|'weak'|'team'>`.
- [ ] UI: chip del nivel de acción en el detalle y en la leyenda; nivel de evidencia junto a cada fuente.

### F4: informe para el médico
- [ ] `buildReport(readings, profile, now, days=7): string`, puro y bilingüe vía `t`, con tests (incluido el caso sin datos).
- [ ] Botón "Send report to Ground" en Crew, enviado como mensaje con el retardo del escenario. Ground lo muestra con saltos de línea.

### F5: clima espacial NASA DONKI
- [ ] `parseDonki(json): SpaceWeather` y `shouldFetch(cachedAt, now)` puros, con tests (incluye 429 y formato inválido).
- [ ] Tarjeta en Crew (y resumen en Ground). Caché en localStorage; SEP genera el aviso de refugio.

### F6: blindaje para la demo en vivo
- [ ] Persistir lo que Ground ya vio y contar solo los mensajes no leídos (tests).
- [ ] Sala Supabase: crear con `seed-<sala>.sql` y probar celular ↔ computador.
- [ ] Prueba de carga: 5.000 lecturas y 300 mensajes. Medir el tiempo de render; si pasa de 100 ms, quitar el re-render de cada segundo en las vistas pesadas.
- [ ] Respaldo local ensayado. Guion de la demo en vivo (`debate/GUION_DEMO.md`).

### F7: verificación final y republicar
- [ ] Tests, build, móvil a 375 px, EN/ES, PWA, link público. Actualizar `ENTREGA`, README y declaración de IA.
