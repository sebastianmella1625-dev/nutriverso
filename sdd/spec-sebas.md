# Spec: prototipo de Sebas, "Sistemas + nutrición"

Estado: **aprobado** (Sebas eligió el concepto el 2026-11-14). Lo rige `brief-prototipos.md` (secciones 1 a 4) y `constitution.md`.

## Intención
El astronauta abre la app, ve su cuerpo dividido en 5 sistemas con un semáforo cada uno y entiende en segundos qué está bien y qué no, por qué (qué peligro de NASA lo explica) y qué hacer. Ground ve a toda la tripulación en vivo y responde con mensajes que llegan con el retardo real de la comunicación. **Lo que nos diferencia es la nutrición:** está dentro de los semáforos, no en una pestaña aparte.

**Anti-objetivo:** un tablero bonito que no le dice al astronauta qué hacer. Cada estado distinto de "ok" trae una acción concreta.

## Vista Crew (móvil primero)
1. **Figura humana SVG** con 5 zonas clicables y un semáforo en cada una (ok, vigilar, alerta, crítico), con ícono y texto además del color.
2. **Detalle del sistema** (al tocar una zona):
   - los indicadores del sistema con su último valor;
   - la tendencia de 7 a 30 días en un gráfico;
   - el peligro de NASA HRP asociado, con link;
   - qué significa en palabras simples;
   - la acción sugerida;
   - "Avisar a Ground" si el estado es alerta o crítico.
3. **Check-in diario:** un formulario con los 11 indicadores del contrato, en pasos cortos. Al terminar suma una racha de días seguidos (gamificación ligera).
4. **Bandeja de mensajes de Ground.** Muestra "en tránsito: llega en X" mientras `deliver_at` no se cumple.

## Vista Ground (escritorio)
1. **Lista de tripulantes en vivo**, ordenada por gravedad: el peor sistema primero.
2. **Detalle por tripulante:** los 5 sistemas, tendencias y lecturas recientes.
3. **Enviar un mensaje** eligiendo el escenario de distancia: ISS (casi sin retardo), Luna (≈1,3 s) o Marte (3 a 22 min). Hay un interruptor "demo acelerada" que convierte minutos en segundos para mostrarlo en vivo.

## Mapa de indicadores a sistemas (propuesta del equipo, la valida Nutrición)
| Sistema | Indicadores | Peligro NASA HRP |
|---|---|---|
| Mente | mood, sleep_hours | Isolation & confinement |
| Corazón | heart_rate, bp_systolic, bp_diastolic | Altered gravity (fluid shift) |
| Hueso | water_ml, energy_kcal | Altered gravity (desmineralización; la hidratación baja suma riesgo de cálculo renal) |
| Músculo | protein_g, body_mass_kg | Altered gravity (atrofia) y nutrición inadecuada |
| Inmune y metabólico | body_temp, glucose | Hostile closed environment y radiación |

El estado de un sistema es el **peor** estado de sus indicadores.

## Umbrales (cada uno con su fuente; ⚠ = falta verificar la fuente antes del final)
| Indicador | Ok | Vigilar | Alerta | Crítico | Fuente |
|---|---|---|---|---|---|
| bp_systolic / bp_diastolic (mmHg) | <120 y <80 | 120–129 y <80 | 130–139 o 80–89 | ≥140 o ≥90 (crisis >180 o >120) | AHA/ACC 2017 |
| heart_rate (lpm, reposo) | 60–100 | 50–59 o 101–110 | 40–49 o 111–130 | <40 o >130 | AHA (rango normal en reposo); los cortes extremos son del equipo ⚠ |
| glucose (mg/dL, ayuno) | 70–99 | 100–125 | ≥126 o 54–69 | <54 | ADA Standards of Care 2026 |
| body_temp (°C) | 36,1–37,2 | 37,3–37,9 | 38,0–39,4 | ≥39,5 o <35 | criterios clínicos estándar ⚠ |
| sleep_hours | ≥7 | 6–6,9 | 5–5,9 | <5 | AASM/SRS (adultos ≥7 h) |
| mood (1 a 5, autorreporte) | 4–5 | 3 | 2 | 1 | escala del equipo, no clínica (se declara así) |
| water_ml | ≥2000 | 1500–1999 | 1000–1499 | <1000 | requerimientos nutricionales de NASA para la ISS ⚠ |
| energy_kcal (% de la meta) | ≥90 % | 80–89 % | 70–79 % | <70 % | NASA ISS (meta de energía según la OMS) ⚠ |
| protein_g (g/kg) | ≥1,2 | 1,0–1,19 | 0,8–0,99 | <0,8 | NASA ISS / ESPEN ⚠ |
| body_mass_kg (% de pérdida vs basal) | <2 % | 2–4,9 % | 5–9,9 % | ≥10 % | GLIM 2019 (>5 % = criterio de desnutrición) |

## Datos
- Contrato de `brief-prototipos.md` §3 (las tablas readings y messages).
- **Capa de datos intercambiable:**
  - `mock` usa BroadcastChannel y localStorage. Sincroniza en vivo entre pestañas del mismo equipo y no necesita cuentas.
  - `supabase` se activa si existen `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- **Misión simulada para la demo:** 30 días y 2 tripulantes, generados con una semilla.
  - crew-01 bebe poca agua y va perdiendo masa, así que hueso y músculo bajan a alerta.
  - crew-02 está estable y su sueño cae los últimos días.

## Arquitectura
- Vite + React + TypeScript, vite-plugin-pwa, Recharts y Vitest.
- `src/domain/`: TypeScript puro. Contiene umbrales, clasificación, estado por sistema, acciones, retardo y la misión simulada. Tiene tests y no importa React.
- `src/data/`: una interfaz `Store` con las implementaciones mock y supabase.
- `src/i18n/`: los diccionarios en.ts y es.ts.
- `src/ui/`: las vistas crew y ground y sus componentes. Los tokens de diseño son propios, con estética oscura de "mission control" y contraste AA.
- Rutas: `#/crew` y `#/ground`. Se usa hash routing para que funcione en GitHub Pages.

## Fuera de alcance (prototipo)
Login real, varios equipos, notificaciones push e ingreso por cámara.
