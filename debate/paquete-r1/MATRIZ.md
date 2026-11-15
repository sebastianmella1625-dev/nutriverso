# Matriz comparativa de los 3 prototipos (NutriVerso)

La armó Claude de Sebas el 14-11-2026 a las 23:30. Fuentes: las 3 `ENTREGA.md`, los `CONTEXTO_INTEGRACION.md` de Miguel y Camila, y una **prueba de carga real** de cada app en el navegador.

## Verificación hecha por Claude de Sebas (no solo lo que declara cada ficha)
- **Sebas:**
  - 106 tests en verde;
  - build de producción con manifest y service worker activado;
  - Crew ↔ Ground probado en 2 pestañas: mensaje con 12 s de retardo en tránsito y luego entregado; aviso del crew que genera banner en Ground;
  - sin scroll horizontal a 375 px.
- **Miguel:** la app carga sin errores de consola. Se ve la pantalla de bienvenida con "Cargar datos de demostración", el botón EN y 5 pestañas (Hoy, Registrar, Cuerpo, Tendencias, Aprender). El logo está marcado "generado con IA".
- **Camila:** la app carga y abre un asistente "Configura tu perfil de misión" (solo en español). Hay 1 error de consola: falta el archivo del service worker (404), tal como ella declara.
- Ninguna afirmación de Miguel o Camila sobre lo que funciona se ha contradicho todavía. Tampoco se probaron a fondo; eso viene en la integración.

## Tabla
| | Sebas | Miguel | Camila |
|---|---|---|---|
| Tiempo real Crew ↔ Ground | ✅ con retardo Tierra–Marte | ❌ cola local para copiar | ❌ respuestas simuladas |
| Vista del médico en Tierra | ✅ ranking, banner, hilo | ❌ (solo un resumen de texto) | ~ vista profesional local ficticia |
| PWA instalable | ✅ verificada | ~ existe, sin verificar | ❌ |
| Inglés / español | ✅ / ✅ | ✅ / ✅ (+ unidades de EE. UU.) | ❌ / ✅ |
| Indicadores | 11 (6 del reto + 4 de nutrición + masa) | 22 (vitales, nutrición, Bristol, Armstrong, sodio, vitamina D, ciclo…) | muchos registros, pero los vitales **no se clasifican** |
| Metas nutricionales | fijas (agua 2000 mL, energía fija por tripulante) | **NASA JSC-67378 por fórmula**: EER + EVA, agua 32 mL/kg | EER NASA (`ESTIMATED_UNAPPROVED`) |
| Cuándo avisar a Tierra | semáforo + botón "Notify Ground" en alerta o crítico | **3 niveles de acción**: médico ya / resumen semanal / autocuidado | solo emergencia declarada manualmente |
| Fuentes | fuente por umbral (5 con ⚠) | **fuente + nivel de evidencia** por número | muy prudente; dice qué no se debe concluir |
| Músculo | proteína + masa corporal | prensión vs. base personal (−10 %) | **MyoShield**: compara solo mediciones con el mismo protocolo y calidad |
| Fases de la misión | ❌ | ✅ (antes, primeros días, vuelo, regreso) | ✅ (pre, vuelo, post, recuperación) |
| Laboratorio | ❌ | ✅ (22 exámenes, rango del laboratorio) | ✅ BioScan (CSV, procedencia de la muestra) |
| Informe para el médico / exportar | ❌ | ✅ resumen de 7, 14 o 30 días + CSV | ✅ JSON, CSV e informe HTML |
| Datos de NASA en vivo | ❌ | ~ DONKI (clima espacial), sin verificar | ❌ |
| Gamificación | racha + 3 insignias | insignias | gamificación |
| Calidad del código | modular TS, dominio puro, 106 tests | 1 HTML de 285 KB, sin tests unitarios (135 comprobaciones manuales) | 1 HTML de 368 KB, 9 scripts inline (78 comprobaciones automatizadas) |

## Lo que coincide entre Miguel y Camila (llegaron a lo mismo por separado)
Laboratorio con el rango del propio laboratorio, fases de la misión, fuerza de prensión contra la base, EER de NASA con EVA, Bristol, Armstrong, ciclo menstrual opcional y exportación para investigación. **Es una señal fuerte de que esas piezas importan.**

## Choques de umbrales (regla D-40: NASA primero, luego guías clínicas)
| Indicador | Sebas | Miguel | Camila | Con D-40 queda |
|---|---|---|---|---|
| Agua | 2000 mL fijos | 32 mL/kg, mínimo 2500 (H) / 2100 (M) | — | **Miguel (NASA JSC-67378)** |
| Pérdida de peso | 2 / 5 / 10 % (GLIM) | 3,3 / 5 % (NASA Rev D) | descriptivo | **Miguel (NASA)**, por validar con Nutrición |
| Energía | % de una meta fija | EER IOM/NASA, cortes 80/90 % | EER NASA | **EER NASA** con los cortes 70/80/90 % |
| Proteína | g/kg (1,2 / 1,0 / 0,8) | ≥ 1,2 g/kg (JSC-67378) | 1,2–1,8 g/kg | NASA ≥ 1,2 g/kg |
| Presión arterial | AHA 120/80 | 130/85 (referencia general) | sin clasificar | **AHA (guía clínica)** |
| Frecuencia cardiaca | 60–100 | 50–100 | sin clasificar | AHA, por decidir |
| Temperatura | 36,1–37,2 | 36,0–37,5 | sin clasificar | por decidir con Nutrición |

## Presupuesto de tiempo (problema real)
- Trasplantes candidatos (D-39): unas **19 h** en total.
- Tiempo útil hasta el cierre (domingo 23:59): unas **12–14 h**, que además incluyen la demo, la página Project en inglés y la publicación.
- **El debate tiene que priorizar**: qué entra seguro, qué entra si sobra tiempo y qué se descarta.
