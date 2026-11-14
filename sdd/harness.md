# Harness: estado del trabajo

**Para retomar:** leer `../00_CONTEXTO.md` → `../01_RECURSOS.md` → `constitution.md` → `decisiones.md` → este archivo.

## Mapa del repo
```
Hackaton/
├─ 00_CONTEXTO.md            bases, reto, entrega, rúbrica
├─ 01_RECURSOS.md            herramientas, datos NASA, conectores
├─ sdd/
│  ├─ constitution.md        reglas que no se discuten
│  ├─ decisiones.md          única fuente de verdad
│  ├─ brief-prototipos.md    lo que se pega a las 3 IAs
│  └─ harness.md             este archivo
├─ prototipos/
│  ├─ PLANTILLA_ENTREGA.md   ficha que completa cada IA
│  ├─ sebas/                 prototipo 1 (se construye aquí)
│  ├─ miguel/                prototipo 2 (llega código + ENTREGA.md)
│  └─ camila/                prototipo 3 (llega código + ENTREGA.md)
├─ debate/
│  ├─ PROTOCOLO.md           rondas R1 y R2 + conclusión
│  └─ r1-*.md, r2-*.md, CONCLUSION.md   (se generan)
└─ final/                    prototipo final (fase 3)
```

## Estado (2026-11-14)
| Fase | Estado |
|---|---|
| Contexto, bases y recursos | ✅ |
| Constitution y decisiones al día con el método del equipo | ✅ |
| Brief común, plantilla de entrega y protocolo de debate | ✅ aprobado (rige solo el prototipo Sebas; el correo no se envió) |
| Proyecto Supabase creado y tablas del contrato aplicadas | ⛔ lo hace Sebas |
| Fase 1: prototipo Sebas | ✅ 9/9 tareas, 106 tests, revisado. Ficha: `prototipos/sebas/ENTREGA.md`. Sin publicar (solo WiFi local). Ledger: `.superpowers/sdd/plan-sebas/progress.md` |
| Fase 1: prototipos Miguel y Camila | 🔄 casi terminados, hechos sin el brief. Sebas les pide el contexto y el código por chat para traerlos aquí |
| Fase 2: debate R1, R2 y conclusión | ⬜ |
| Fase 3: prototipo final y deploy en GitHub Pages | ⬜ |
| Fase 4: demo y página Project en inglés | ⬜ |

## Pasos que solo puede hacer Sebas
1. ~~Configurar git~~ ✅ hecho el 14-11 (nombre + correo noreply global). Primeros commits: bd3d737, 23bae14.
2. Crear el proyecto en Supabase. Luego, en el SQL Editor, pegar el bloque SQL de `brief-prototipos.md` §3. Poner la URL y la anon key en `prototipos/sebas/.env.local` (la escribe Sebas, no se pega en el chat).
3. Compartir la URL y la anon key con Miguel y Camila para que sus prototipos usen el mismo proyecto.
4. Mandarles `brief-prototipos.md` y `PLANTILLA_ENTREGA.md`.
5. Preguntar a la Local Lead la hora del juzgamiento local (P-04).

## Horario propuesto (P-06, por confirmar)
| Cuándo | Qué |
|---|---|
| Sáb 13:00–14:00 | Llegada, acreditación, enviar el brief al equipo, Supabase listo |
| Sáb 14:00–17:30 | **Fase 1:** los 3 prototipos en paralelo (time-box duro) |
| Sáb 17:30–19:00 | **Fase 2:** R1, R2 y CONCLUSION |
| Sáb 19:00–21:00 | **Fase 3:** esqueleto del final con lo que se integra (la sede cierra a las 21:00) |
| Dom 08:00–13:00 | Fase 3: funciones finales, i18n, PWA y deploy |
| Dom 13:00–16:00 | **Fase 4:** demo (30 s o 7 slides), página Project en inglés, declaración de IA |
| Dom antes de 17:00 | Entregar en la sede (cierre global 23:59) |

## Entorno verificado
- Node v24.18.0 y npm 11.16.0
- git 2.55, con repo propio en `Hackaton/` (falta la identidad)
- gh con sesión
- Codex CLI con sesión de ChatGPT
