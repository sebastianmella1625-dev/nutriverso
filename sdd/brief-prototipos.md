# Brief común para los 3 prototipos: NutriVerso, NASA Space Apps 2026

> **Instrucciones para cada integrante:** pega este documento completo como primer mensaje a tu IA (Claude de Sebas, Claude de Miguel o ChatGPT de Camila). Es el mismo para los tres, así los prototipos se pueden comparar. Las secciones 1 a 4 son obligatorias. La sección 5 es tu espacio creativo.

---

## 1. El reto (resumen)
**"Create Health Monitoring Software for Astronauts on Space Missions"**. Página: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

En misiones largas, la radiación, el aislamiento, la gravedad alterada y el ambiente cerrado afectan el sistema inmune, los huesos, el corazón, la nutrición y la salud mental. El astronauta tiene que vigilarse a sí mismo. Hay que construir una **herramienta visual** que:
- registre indicadores de salud;
- le muestre al astronauta en qué estado está;
- le diga qué hacer y cuándo avisar a los médicos en Tierra.

Fuente NASA obligatoria (hay que citarla en la app): NASA Human Research Program
- 5 Hazards: https://www.nasa.gov/hrp/hazards/
- Risks: https://www.nasa.gov/hrp/risks/

**El jurado puntúa de 1 a 5:** Impact, Creativity, Validity, Relevance y Presentation.

## 2. Restricciones obligatorias (las mismas para los tres)
1. **PWA** (Progressive Web App), instalable en iOS y Android y que abra desde un link público. Stack sugerido: Vite + React + `vite-plugin-pwa`. Si tu IA propone otro stack web, tiene que seguir siendo una PWA.
2. **Bilingüe EN/ES.** La app parte en inglés y tiene un selector de idioma. Los textos salen de un diccionario, no se escriben directo en los componentes.
3. **Dos roles en tiempo real:**
   - **Crew**: el astronauta, en el móvil. Registra indicadores y ve su estado.
   - **Ground**: el flight surgeon en Tierra. Ve los datos del crew en vivo y le envía mensajes o recomendaciones.
4. **Tiempo real con Supabase**, respetando el contrato de datos de la sección 3. Si todavía no tienes la URL y la clave del proyecto, usa una capa simulada con la misma forma (un mock) para poder cambiarla después sin reescribir.
5. **Solo datos simulados.** Nunca datos de personas reales. La app lo declara ("Simulated data").
6. **La app orienta, no diagnostica.** Cada umbral que uses tiene una fuente citable (anótala en tu entrega). Ante un valor crítico, la acción siempre incluye avisar a Ground.
7. El color nunca es la única señal: cada estado lleva texto o ícono. Contraste WCAG AA.
8. Hay que declarar el uso de IA. Las imágenes generadas con IA llevan marca de agua. No se usan el logo de NASA ni banners de gobierno.

## 3. Contrato de datos (no se cambia: así los tres prototipos se pueden fusionar)

```sql
-- Supabase / Postgres
create table readings (
  id          uuid primary key default gen_random_uuid(),
  crew_id     text not null,                 -- ej. 'crew-01'
  indicator   text not null check (indicator in (
                'heart_rate','bp_systolic','bp_diastolic','glucose',
                'body_temp','sleep_hours','mood',
                'water_ml','energy_kcal','protein_g','body_mass_kg')),
  value       numeric not null,
  unit        text not null,                 -- 'bpm','mmHg','mg/dL','°C','h','1-5','mL','kcal','g','kg'
  measured_at timestamptz not null default now(),
  source      text not null default 'simulated'
);

create table messages (
  id          uuid primary key default gen_random_uuid(),
  crew_id     text not null,
  from_role   text not null check (from_role in ('crew','ground')),
  body        text not null,
  created_at  timestamptz not null default now(),
  deliver_at  timestamptz                    -- opcional: simular el retardo de comunicación Tierra–nave
);

alter table readings enable row level security;
alter table messages enable row level security;
-- Políticas de DEMO (los datos son simulados): anon puede leer e insertar.
create policy demo_read_readings   on readings for select to anon using (true);
create policy demo_insert_readings on readings for insert to anon with check (true);
create policy demo_read_messages   on messages for select to anon using (true);
create policy demo_insert_messages on messages for insert to anon with check (true);

alter publication supabase_realtime add table readings, messages;
```

Variables de entorno (en `.env.local`, **nunca** en el repo): `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

**Indicadores base:** los 6 del reto (presión, frecuencia cardiaca, glucosa, temperatura, sueño y ánimo) más 4 de nutrición e hidratación (agua, energía, proteína y masa corporal). Es la ventaja de NutriVerso: la "nutrición inadecuada" es uno de los riesgos que nombra el propio reto.

## 4. Qué entregar al final (time-box: ver horario del equipo)
1. Código: link a un repo o un `.zip`. El README dice cómo correrlo.
2. 3 a 5 capturas, como mínimo de la vista Crew, la vista Ground y un estado de alerta.
3. La ficha `ENTREGA.md` completa (plantilla aparte). Es lo que leerán las otras IAs en el debate.

## 5. Tu espacio creativo (aquí deben diferenciarse los prototipos)
Elige tú cómo resolver esto. No hace falta cubrirlo todo:
- ¿Cómo se ve el estado de salud? Figura humana clicable, sistemas corporales, tablero, línea de tiempo…
- ¿Cómo se motiva al astronauta a medirse? Rutina diaria, recordatorios, gamificación…
- ¿Cómo entra la nutrición de forma útil y no decorativa?
- ¿Qué ve Ground y cómo prioriza alertas de varios tripulantes?
- ¿Se simula el retardo de comunicación? Hacia Marte va de unos 3 a 22 minutos por tramo, según la posición de los planetas.
- ¿Distintos entornos? Nave, estación, base lunar o marciana.
