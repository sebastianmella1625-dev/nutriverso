# NASA Space Apps 2026: recursos disponibles y estado de conexión

Revisado el sábado 14-11-2026 a las 08:15. Leer después de `00_CONTEXTO.md`.

Leyenda: ✅ listo y probado · ⚠️ listo con una salvedad · ⛔ falta una acción tuya

## 1. Para programar (máquina local)

| Recurso | Estado | Nota |
|---|---|---|
| Node 24.18 + npm 11.16 | ✅ | Basta para Vite, React o HTML/JS sin framework |
| Python 3.14 | ✅ | Sirve para scripts de datos (simular lecturas, limpiar CSV de NASA) |
| Git 2.55 | ⚠️ | No hay `user.name` global. Ver paso pendiente 1 |
| GitHub CLI `gh` | ✅ | Sesión iniciada como `sebastianmella1625-dev`, permisos `repo` y `workflow`. Sirve para crear el repo y publicar en GitHub Pages |
| Codex CLI 0.163 | ✅ | Sesión iniciada con ChatGPT. Es el segundo asistente fijado |
| VS Code 1.145 | ✅ | Editor principal |
| USWDS 3.14.0 (npm `@uswds/uswds`) | ✅ | Disponible para instalar. Ver la salvedad de la sección 5 |
| Vercel, Netlify, Firebase CLI, gcloud, Azure CLI, Docker | ⛔ no instalados | No hacen falta: GitHub Pages da el link público sin login que piden las bases |

**Ojo con la carpeta:** `Hackaton/` vive dentro del repo git de tu carpeta de usuario (`C:/Users/camil`). El proyecto necesita su propio repo (paso pendiente 2).

## 2. Datos y recursos de NASA (requisito para premio global)

| Fuente | Estado | Uso posible |
|---|---|---|
| NASA HRP, 5 Hazards (nasa.gov/hrp/hazards) | ✅ 200 | Marco de los 5 peligros. Es el recurso que cita el reto |
| NASA HRP, Risks (nasa.gov/hrp/risks) | ✅ 200 | Lista oficial de riesgos, incluido el riesgo nutricional |
| Human Research Roadmap (humanresearchroadmap.nasa.gov) | ✅ 200 | Riesgos con evidencia y vacíos. Sirve para el criterio "Validity" |
| NASA OSDR (osdr.nasa.gov) | ✅ 200, la API de búsqueda responde JSON | Estudios reales de vuelo y reposo en cama. Probado: devuelve "Woman skeletal muscle transcriptome with bed rest and countermeasures" |
| NASA Life Sciences Data Archive (lsda.jsc.nasa.gov) | ✅ 200 | Datos de salud de astronautas (resúmenes públicos) |
| api.nasa.gov y data.nasa.gov | ⚠️ timeout desde aquí | Probar de nuevo en la sede. No son críticos para este reto |
| CSA (radiación y ciencia en el espacio) | Listado en `00_CONTEXTO.md` | Contexto complementario |

Decisión fijada: solo datos públicos o simulados. Los valores del astronauta en la demo serán simulados y la app lo dirá.

## 3. Conectores de Claude en esta sesión

| Conector | Estado | Para qué sirve en la hackatón |
|---|---|---|
| Gmail | ✅ | Leer correos de la organización (los dos de Space Apps ya están leídos) |
| Google Calendar | ✅ | Agendar hitos internos del equipo |
| Google Drive | ✅ | Compartir material con el equipo |
| Canva | ✅ | Las 7 slides si eligen slides en vez de video |
| Gamma | ✅ | Alternativa rápida para las slides |
| Unsplash | ✅ | Fotos libres para la demo (citarlas) |
| Fish Audio y ElevenLabs | ✅ | Voz en inglés para el video de 30 s |
| Remotion (skill) | ✅ | Armar el video de 30 s por código |
| PubMed, Consensus, bioRxiv | ✅ | Evidencia para umbrales y recomendaciones |
| Claude in Chrome | ✅ (memoria del 14-11) | Navegar la página del equipo en Space Apps con tu sesión |
| GitHub (plugin MCP) | ⛔ pide `/mcp` | No hace falta: `gh` ya cubre todo |
| Figma, Notion, Slack | ⛔ piden `/mcp` | Solo si el equipo ya usa alguno |

## 4. Ofertas globales gratuitas (correo del 13-11)

GoDaddy (dominio + hosting un año), Google Cloud/Firebase, Meteomatics, Microsoft (Azure, GitHub Copilot, Teams) y Miro (plantillas para hackatón).
Algunas piden tarjeta para verificar. **Eso lo haces tú; yo no ingreso datos de pago.** Ninguna es necesaria para entregar.

## 5. Rol activo: USWDS Developer, con una salvedad

USWDS sirve para lo que el reto premia: componentes accesibles (WCAG 2.1 AA), diseño mobile-first, alertas con color **y** texto, y tokens en vez de colores sueltos.

**Lo que NO se usa:** el banner `.gov` ("An official website of the United States government") ni el Identifier de agencia. NutriVerso no es un sitio del gobierno de EE.UU. y ponerlos sería hacerse pasar por uno. Tampoco usaremos el logo de NASA (hay reglas de uso de marca); basta con decir "Built for the NASA Space Apps Challenge".

## 6. Pasos pendientes (en orden)

1. **Identidad de git.** Corre en tu terminal de VS Code:
   ```bash
   git config --global user.name "sebastianmella1625-dev"
   ```
   y el correo noreply de GitHub como `user.email` (lo ves en GitHub → Settings → Emails).
2. **Repo del proyecto.** Antes de crearlo, pregunta al dueño del equipo si ya existe uno. Si no existe, se crea público con `gh repo create` y se publica en GitHub Pages. Tú confirmas el nombre antes de que yo lo cree.
3. **Space Apps Connect.** Únete y pregúntale a la Local Lead de Concepción a qué hora es el juzgamiento local; puede ser antes del cierre de las 23:59 del domingo.
4. **Decisiones del equipo.** Confirma con NutriVerso si ya eligieron stack, idea o reparto de tareas. Sin eso no conviene fijar el diseño.
5. **Diseño antes que código.** Con lo anterior: brainstorming → diseño → plan → código, todo con tiempo máximo por bloque.

## 7. Atribución de IA (obligatoria en la entrega)

- Declarar Claude (Claude Code) y Codex en la descripción del proyecto y en el README.
- Imágenes o video generados con IA llevan marca de agua visible.
- Esta regla de las bases es distinta de los commits: en los commits no va `Co-Authored-By` (tu preferencia de siempre). La declaración va en el README y en el formulario de entrega.
