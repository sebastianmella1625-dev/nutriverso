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

## Pendientes
- P-01 | Concepto ganador: sale del debate (fase 2)
- P-02 | Lista final de indicadores y fuentes de umbral (el brief trae una base mínima)
- P-03 | Nombre del proyecto en inglés
- P-04 | Hora del juzgamiento local (preguntar a la Local Lead)
- P-05 | Sistema de diseño: tokens propios con criterios WCAG o USWDS (`01_RECURSOS.md` §5). Propuesta del UI Designer: tokens propios con estética de "mission control" oscura, tomando de USWDS solo los criterios de accesibilidad, sin el banner .gov ni marcas
- P-06 | Horario por fases (propuesta en `harness.md`, por confirmar)

## Umbrales clínicos
Ninguno fijado todavía. Cada uno se agrega con su fuente según la regla 2 de `constitution.md`.
