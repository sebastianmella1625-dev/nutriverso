# Decisiones: única fuente de verdad

Formato: `D-NN | fecha | decisión | quién | por qué`.

## Fijadas
- D-01 | 2026-11-14 | Reto: "Create Health Monitoring Software for Astronauts on Space Missions" | bases | equipo NutriVerso, sede Concepción
- D-02 | 2026-11-14 | Solo datos simulados o públicos | Sebastián | no hay permisos para datos reales
- D-03 | 2026-11-14 | Sebastián construye el software; el equipo aporta contenido nutricional y clínico | Sebastián | es quien programa
- D-04 | 2026-11-14 | ~~Vite + React estático~~ → **Vite + React como PWA** (reemplazada por D-10) | Sebastián | iOS y Android con un solo link
- D-05 | 2026-11-14 | Repo git propio en `Hackaton/` (`git init` hecho), que se sube a GitHub como público para entregar | Sebastián | la carpeta de usuario ya es un repo
- D-06 | 2026-11-14 | Codex CLI ayuda en este entorno (bloques de código); no es uno de los tres que debaten | Sebastián | el debate es entre las IAs del equipo
- D-07 | 2026-11-14 | Roles activos aquí: Sovereign Health, Healthcare Innovation, Software Architect, UI Designer | Sebastián | elegidos con los hooks
- D-08 | 2026-11-14 | Método: 3 prototipos → debate entre 3 IAs → conclusión global → prototipo final → presentación | equipo | método del equipo
- D-09 | 2026-11-14 | Las IAs: Claude de Sebas (este entorno), Claude de Miguel y ChatGPT de Camila | equipo | una por integrante
- D-10 | 2026-11-14 | La app es una PWA instalable en iOS y Android, con el mismo link público para el jurado | Sebastián | sin tiendas de apps y con el link que exigen las bases
- D-11 | 2026-11-14 | Tiempo real con Supabase Realtime, en un proyecto que crea Sebas en su cuenta | Sebastián | ya tiene cuenta y el plan gratis basta
- D-12 | 2026-11-14 | Interfaz bilingüe EN/ES, que parte en inglés | equipo | el jurado exige inglés y el equipo trabaja en español
- D-13 | 2026-11-14 | Dos roles de usuario: **crew** (astronauta, en el móvil) y **ground** (flight surgeon en Tierra) | equipo | tiempo real entre el espacio y Tierra
- D-14 | 2026-11-14 | Este entorno junta el contexto de los tres prototipos y aloja el final | Sebastián | es el centro de integración
- D-15 | 2026-11-14 | Mapa de indicadores a sistemas = el del spec (5 sistemas; agua y energía en Hueso) | Sebastián | hilo nutricional más fuerte ante el jurado
- D-16 | 2026-11-14 | El estado de un sistema lo define su peor indicador | Sebastián | no esconde ningún problema
- D-17 | 2026-11-14 | Si faltan indicadores: peor estado entre los medidos + marca "incompleto"; "sin datos" solo si falta todo | Sebastián | el astronauta ve lo que sí se sabe
- D-18 | 2026-11-14 | Vigencia: indicadores diarios 36 h, masa corporal 8 días; pasado eso cuentan como sin dato | Sebastián | evitar falsa tranquilidad con mediciones viejas
- D-19 | 2026-11-14 | Escenario de la misión: tránsito a Marte, con retardo de 3 a 22 min (12 min por defecto) | Sebastián | es donde el astronauta más depende de autoevaluarse
- D-20 | 2026-11-14 | Retardo acelerado por defecto (1 min se muestra como 1 s, con etiqueta "demo acelerada") y se puede apagar | Sebastián | la demo dura 30 s
- D-21 | 2026-11-14 | Misión simulada de 30 días con 2 tripulantes: crew-01 se deshidrata y pierde masa (hueso y músculo en alerta); crew-02 con sueño en declive (mente en vigilar) | Sebastián | gancho nutricional
- D-22 | 2026-11-14 | Tripulantes simulados con los nombres del equipo: crew-01 "Miguel" y crew-02 "Camila", marcados como simulados | Sebastián | guiño al equipo; confirmar con Miguel y Camila antes de la demo
- D-23 | 2026-11-14 | Las 25 recomendaciones de acción las redacta Claude (EN/ES) y Nutrición las revisa antes del prototipo final | Sebastián | no frenar el avance
- D-24 | 2026-11-14 | Tono de las recomendaciones: acción concreta + una línea de por qué | Sebastián | educar, como pide el reto
- D-25 | 2026-11-14 | La app abre siempre en inglés y recuerda la elección de idioma | Sebastián | el jurado exige inglés
- D-26 | 2026-11-14 | Mock ahora; Supabase se activa solo cuando haya claves en .env.local (el código soporta las dos) | Sebastián | no bloquear el avance
- D-27 | 2026-11-14 | La misión entra a Supabase con un seed.sql generado (con fechas relativas a now()), que se corre una vez en el SQL Editor | Sebastián | sin duplicados ni carreras
- D-28 | 2026-11-14 | Sala por enlace: `?room=nombre` usa Supabase, aislado por prefijo en crew_id (`nombre:crew-01`); sin room, la app funciona en modo local | Sebastián | que un jurado no ensucie la demo
- D-29 | 2026-11-14 | Botón "Reiniciar demo" solo en modo local; las salas se reinician volviendo a correr el seed.sql (sin permiso anónimo de borrar) | Sebastián + ruling de Claude | evitar que cualquiera con el link borre datos
- D-30 | 2026-11-14 | Figura: astronauta con traje y 5 zonas (casco = mente, pecho = corazón, abdomen = inmune, brazos = músculo, piernas = hueso) | Sebastián | se lee al instante como "salud del astronauta"
- D-31 | 2026-11-14 | Navegación móvil con 3 pestañas abajo: Body, Check-in y Messages | Sebastián | se siente como app nativa instalada
- D-32 | 2026-11-14 | El check-in pide 10 indicadores diarios; la masa corporal solo si la última tiene 7 días o más | Sebastián | coherente con D-18 y más corto
- D-33 | 2026-11-14 | Gamificación: racha de días con check-in + 3 insignias (primera semana, hidratación en meta 5 días, sueño de 7 h o más 5 días) | Sebastián | responde al punto de gamificación del reto
- D-34 | 2026-11-14 | Consola Ground en 2 columnas: tripulación ordenada por gravedad + detalle, conversación y envío (en móvil se apila) | Sebastián | aprovecha la pantalla del flight surgeon
- D-35 | 2026-11-14 | Alertas en Ground: banner destacado (aviso del crew o sistema crítico) que se descarta al abrir al tripulante; sin sonido | Sebastián | visible en la demo y sin permisos del navegador
- D-36 | 2026-11-14 | Mensaje de Ground precargado con la recomendación del peor sistema, editable | Sebastián | demo rápida; la app guía también a Tierra
- D-37 | 2026-11-14 | ~~La base del prototipo final la decide el debate entre las 3 IAs~~ (reemplazada por D-41) | Sebastián | respetar el método del equipo
- D-38 | 2026-11-14 | ~~Debate completo: ronda 1 + ronda 2~~ (reemplazada por D-41) | Sebastián | más sólido
- D-39 | 2026-11-14 | Candidatos a trasplante: rigor clínico de Miguel, clima espacial NASA DONKI, músculo y fases, laboratorio + informe (≈19 h en total; el debate prioriza qué entra según el tiempo) | Sebastián | todos suman a la rúbrica
- D-40 | 2026-11-14 | Regla de umbrales: si existe un requisito NASA (nutrición, líquidos, peso), manda ese; en signos vitales mandan las guías clínicas (AHA, ADA). Lo valida el equipo de Nutrición | Sebastián | lo más defendible ante el jurado
- D-41 | 2026-11-14 | Sin debate entre IAs: con los 3 prototipos en el repo, el equipo decide la versión final según las bases del hackathon (rúbrica, requisitos de entrega, plazo). `debate/r1-sebas.md` y `debate/paquete-r1/MATRIZ.md` quedan como insumo | Sebastián | ahorrar tiempo; el material ya está aquí
- D-42 | 2026-11-14 | Base del final: prototipo de Sebas + piezas de Miguel y Camila como módulos con tests; se toma de Miguel el estilo visual | Sebastián | único con tiempo real, PWA y EN/ES verificados
- D-43 | 2026-11-14 | Entran seguro: (a) rigor clínico de Miguel (3 niveles de acción, nivel de evidencia, metas NASA JSC-67378), (b) informe para el médico por el canal real con retardo, (c) clima espacial NASA DONKI. Si sobra tiempo: prensión + regla MyoShield. Fuera: laboratorio | Sebastián | mayor puntaje por hora
- D-44 | 2026-11-14 | Publicar en GitHub Pages (repo público) temprano el domingo y actualizar con cada avance | Sebastián | asegurar el link exigido por las bases
- D-45 | 2026-11-14 | Juzgamiento local: pitch de máximo 3 min + demo en vivo en tiempo real; el software debe funcionar al 100 % | Sebastián | formato de la sede
- D-46 | 2026-11-14 | Demo en vivo: astronauta en el celular + Tierra en el computador vía Supabase; respaldo: un computador con dos ventanas en modo local (sin internet) | Sebastián | se ve real y no depende solo de la WiFi
- D-47 | 2026-11-15 | Repo público `nutriverso` en GitHub (sebastianmella1625-dev) con Pages vía Actions; se publican final/, el prototipo de Sebas, sdd/ y debate/; el material de Miguel y Camila queda fuera (gitignore y fuera del historial) | Sebastián | sin su OK no se publica su trabajo

## Pendientes
- P-01 | Concepto ganador: sale del debate (fase 2)
- P-02 | Lista final de indicadores y fuentes de umbral (el brief trae una base mínima)
- P-03 | Nombre del proyecto en inglés
- P-04 | Hora del juzgamiento local (preguntar a la Local Lead)
- P-05 | Sistema de diseño: tokens propios con criterios WCAG o USWDS (`01_RECURSOS.md` §5). Propuesta del UI Designer: tokens propios con estética de "mission control" oscura, tomando de USWDS solo los criterios de accesibilidad, sin el banner .gov ni marcas
- P-07 | La entrega global igual exige un video de 30 s o 7 slides en la página Project (aparte del pitch local): definir cuál
- P-08 | Confirmar con Miguel y Camila que aceptan aparecer como tripulantes simulados en la demo
- P-06 | Horario por fases (propuesta en `harness.md`, por confirmar)

## Umbrales clínicos
Ninguno fijado todavía. Cada uno se agrega con su fuente según la regla 2 de `constitution.md`.
