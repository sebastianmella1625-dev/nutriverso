# R1: evaluación de la IA de Sebas (Claude)

Escrita el 14-11-2026 a las 23:35. Con conflicto de interés declarado: evalúo también el prototipo que construí. Me baso en la matriz y en la prueba de carga de las 3 apps.

## 1. Notas con la rúbrica oficial (1 a 5)
| Criterio | Sebas | Miguel | Camila | Justificación breve |
|---|---|---|---|---|
| Impact | 4 | 4 | 3 | **S:** cierra el ciclo astronauta → Tierra → astronauta con retardo real. **M:** registro de 1 minuto con acciones concretas, pero no llega a Tierra. **C:** expediente muy completo, pero no orienta la acción del día a día. |
| Creativity | 4 | 4 | 4 | **S:** nutrición dentro de los sistemas y retardo como experiencia. **M:** 3 niveles de acción, cola de Marte y DONKI. **C:** MyoShield (comparabilidad por protocolo) es original. |
| Validity | 3 | 5 | 4 | **S:** fuentes con 5 ⚠, pocos indicadores, 106 tests. **M:** fuente + nivel de evidencia por número, metas NASA JSC-67378 con fórmula visible. **C:** muy riguroso, pero no clasifica los vitales, así que no responde "¿cuándo avisar?". |
| Relevance | 5 | 4 | 3 | **S:** cubre los 6 indicadores del reto, peligros de NASA HRP, colores, tendencias, gamificación y Tierra. **M:** le falta la vista de Tierra. **C:** sin inglés y sin cortes para los vitales. |
| Presentation | 3 | 4 | 2 | **S:** interfaz sobria y funcional, sin link público ni demo. **M:** la más pulida y bilingüe, con logo, pero larga para 1 minuto de jurado. **C:** solo en español, con un asistente largo al inicio. |

## 2. Base recomendada para el prototipo final
- **Base: Sebas.**
- Por qué:
  - Es la única que ya cumple los requisitos duros del equipo (tiempo real Crew ↔ Ground, PWA verificada, EN/ES).
  - Su dominio es TypeScript puro y tiene tests: lo de Miguel y Camila entra como módulos nuevos sin romper lo que funciona.
  - Agregarle Ground en tiempo real a un HTML de 285 o 368 KB sin tests, en 12 h, es el riesgo más alto de los tres caminos.
- **Pero la interfaz de Miguel es mejor.** Propongo tomar de él su tono visual y la pantalla "Hoy".

## 3. Las 3 ideas que SÍ O SÍ deben estar en el final
1. **Los 3 niveles de acción de Miguel** ("avisa al médico ya / va en el resumen semanal / autocuidado ahora") con fuente y nivel de evidencia. Responde la pregunta del reto "¿cuándo amerita atención de la tripulación o de los flight surgeons?".
2. **El canal real con Tierra con retardo de Marte (Sebas), alimentado por el resumen para el médico de Miguel.** El "puente con Tierra" deja de ser una cola local y pasa a ser un mensaje de verdad.
3. **Metas nutricionales NASA personalizadas** (EER JSC-67378 + EVA, agua 32 mL/kg). Es el sello de NutriVerso como equipo de Nutrición y reemplaza mis metas fijas.

## 4. Prioridad de los trasplantes, con el tiempo real disponible
| Trasplante | Decisión | Por qué |
|---|---|---|
| (a) Rigor clínico de Miguel | **Entra seguro** | Es la mayor alza de Validity por hora y contiene 2 de las 3 ideas imprescindibles. |
| (b) Clima espacial NASA DONKI | **Entra seguro** (≈2 h) | Es barato, usa datos vivos de NASA (requisito del premio global) y se ve muy bien en la demo. Antes hay que verificar que la API responda. |
| (c) Músculo y fases | **Si sobra tiempo**: solo prensión + regla MyoShield | La comparación por fase es valiosa, pero el jurado no la ve en 1 minuto. |
| (d) Laboratorio + informe | **Informe: entra seguro** (es parte de la idea 2). **Laboratorio: descartar** | El laboratorio es valioso, pero es lo más caro (4–6 h) y lo menos visible en la demo. |

## 5. Los 2 riesgos principales
1. **El alcance.** Si se intenta todo, se llega al cierre sin demo ni link público, y la sección Presentation se desploma. Hay que congelar funciones el domingo a las 15:00.
2. **Afirmar cosas no verificadas.** El escáner de fotos, las notificaciones, DONKI y Supabase entre dispositivos no deben aparecer en la demo como "funciona" si no se probaron. El jurado de Validity castiga las promesas.
