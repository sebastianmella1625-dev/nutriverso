# ENTREGA: prototipo de Sebas

## 1. Identidad
- Integrante: Sebastián Mella
- IA usada: Claude Code (Anthropic). Construyó el código; Sebas tomó las 36 decisiones registradas en `sdd/decisiones.md`.
- Código: `prototipos/sebas/app/` (repo local `Hackaton/`, todavía sin publicar)
- En vivo: solo en la red local (`npm run build` + `npm run preview -- --host`). No hay link público aún.
- Horas invertidas: ≈ una tarde (sábado 14-11), con 9 tareas SDD y TDD.

## 2. Concepto en una frase
El astronauta ve **su cuerpo con traje dividido en 5 sistemas con semáforo**, y la **nutrición vive dentro de los semáforos**: el agua y la energía alimentan Hueso, la proteína y la masa alimentan Músculo. Tierra lo sigue en vivo y le responde con el **retardo real de Marte**.

## 3. Qué funciona de verdad (probado)
- [x] Vista Crew: check-in diario en 3 pasos (10 indicadores; la masa corporal solo cuando toca, cada 7 días). Acepta coma decimal y rechaza valores imposibles.
- [x] Vista Crew: figura del astronauta con 5 zonas tocables. Cada estado lleva ícono y texto además del color. El detalle por sistema trae el último valor, una tendencia de 30 días, la acción recomendada, la fuente del umbral y el peligro NASA HRP con link.
- [x] Vista Ground en tiempo real: tripulación ordenada por gravedad, banner cuando un tripulante avisa o entra en crítico, tendencias por sistema y conversación en ambos sentidos.
- [x] Mensajes Ground → Crew y Crew → Ground con retardo según la distancia (ISS, Luna o Marte de 3 a 22 min, con demo acelerada). Mientras viajan solo se ve "en tránsito".
- [x] EN/ES: la app parte en inglés y el test garantiza la paridad de claves.
- [x] Instalable como PWA: manifest válido y service worker activado en el build de producción. Instalarla en un celular requiere HTTPS, es decir, publicarla.
- [x] Mock local, que sincroniza pestañas del mismo navegador.
- [ ] Supabase: el código, el esquema y el generador de `seed.sql` por sala están listos (`?room=nombre`), pero **no se ha probado** porque aún no existe el proyecto.
- Otras: racha y 3 insignias, botón "Reset demo", recarga automática al volver a primer plano.

## 4. Qué NO funciona o quedó simulado
- Todos los datos son simulados: una misión de 30 días con "Miguel" (se deshidrata y pierde masa) y "Camila" (duerme cada vez menos).
- El tiempo real entre **dos dispositivos distintos** necesita Supabase. Sin Supabase, solo se sincronizan pestañas del mismo navegador.
- 5 fuentes de umbral marcadas con ⚠ siguen sin verificar: temperatura, agua, energía, proteína y los cortes extremos de frecuencia cardiaca.
- Las 25 recomendaciones clínicas las redactó la IA y falta que Nutrición las revise.
- Menores conocidos:
  - el banner de Ground reaparece al recargar la página;
  - el contador de mensajes muestra el total, no los no leídos;
  - sin probar en un celular de gama baja.

## 5. Umbrales clínicos usados
| Indicador | Normal | Vigilar | Alerta | Crítico | Fuente |
|---|---|---|---|---|---|
| PA sistólica (mmHg) | <120 | 120–129 | 130–139 | ≥140 | AHA/ACC 2017 |
| PA diastólica (mmHg) | <80 | (no hay) | 80–89 | ≥90 | AHA/ACC 2017 |
| FC en reposo (lpm) | 60–100 | 50–59 o 101–110 | 40–49 o 111–130 | <40 o >130 | AHA; cortes extremos del equipo ⚠ |
| Glucosa en ayunas (mg/dL) | 70–99 | 100–125 | ≥126 o 54–69 | <54 | ADA 2026 |
| Temperatura (°C) | 36,1–37,2 | 37,3–37,9 o 35,0–36,0 | 38,0–39,4 | ≥39,5 o <35 | criterios clínicos ⚠ |
| Sueño (h) | ≥7 | 6–6,9 | 5–5,9 | <5 | AASM/SRS |
| Ánimo (1–5) | 4–5 | 3 | 2 | 1 | escala del equipo, no clínica |
| Agua (mL/día) | ≥2000 | 1500–1999 | 1000–1499 | <1000 | NASA ISS ⚠ |
| Energía (% de la meta) | ≥90 | 80–89 | 70–79 | <70 | NASA ISS (OMS) ⚠ |
| Proteína (g/kg) | ≥1,2 | 1,0–1,19 | 0,8–0,99 | <0,8 | NASA ISS / ESPEN ⚠ |
| Masa corporal (% de pérdida) | <2 | 2–4,9 | 5–9,9 | ≥10 | GLIM 2019 |

Reglas de agregación:
- El estado de un sistema lo define su peor indicador.
- Si falta uno, se muestra lo medido con la marca "incompleto".
- Las mediciones valen 36 h; la masa corporal, 8 días.

## 6. Uso de NASA y otras fuentes
- NASA Human Research Program: 5 Hazards (https://www.nasa.gov/hrp/hazards/) y Risks (https://www.nasa.gov/hrp/risks/). Cada sistema enlaza a su peligro y la app los cita en el pie.
- Guías clínicas para los umbrales (tabla de arriba).
- Herramientas: Vite, React 19, TypeScript, Recharts, vite-plugin-pwa, Vitest y Supabase JS.
- Uso de IA: Claude Code escribió el código y las recomendaciones, y debe declararse en la página Project. Íconos generados por código, sin logos de NASA.

## 7. Las 3 mejores ideas de este prototipo
1. **La nutrición dentro de los semáforos, no en una pestaña aparte.** Si Miguel bebe poco, su sistema **Hueso** se pone en alerta, porque la deshidratación con pérdida ósea aumenta el riesgo de cálculo renal. Responde directo al riesgo de "nutrición inadecuada" del reto.
2. **El retardo real de comunicación como parte de la experiencia.** Los mensajes muestran "en tránsito · llega en X s" (Marte de 3 a 22 min, acelerado para la demo). Eso explica *por qué* el astronauta tiene que autoevaluarse.
3. **"Sin datos" no es "bien".** Un sistema sin mediciones, o con mediciones vencidas, se ve gris con borde punteado, nunca verde. Evita una falsa tranquilidad.

## 8. Autoevaluación con la rúbrica oficial (1 a 5)
| Criterio | Nota | Por qué |
|---|---|---|
| Impact | 4 | Responde a todo lo que pide el reto (autoevaluación, guía y cuándo avisar a Tierra) con una misión plausible a Marte. |
| Creativity | 4 | Nutrición integrada en los sistemas, figura con traje y retardo real de comunicación. |
| Validity | 3 | Cada umbral tiene fuente y hay 106 tests, pero 5 fuentes siguen con ⚠ y Nutrición todavía no revisa las recomendaciones. |
| Relevance | 5 | Cubre los 6 indicadores del reto, peligros de NASA HRP, gamificación, colores y tendencias, todo lo que sugieren las bases. |
| Presentation | 3 | La interfaz se ve terminada en móvil y escritorio, pero falta el link público y la demo de 30 s. |

## 9. Capturas
- `captura-crew.jpg`: vista Crew (Miguel, hueso y músculo en alerta, racha e insignias).
- `captura-alerta.jpg`: detalle de Hueso con la acción, las tendencias y las fuentes.
- `captura-ground.jpg`: consola Ground con el banner "Miguel notified Ground" y el ranking.
