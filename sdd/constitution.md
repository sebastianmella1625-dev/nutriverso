# Constitution: NutriVerso, Space Apps 2026

Reglas que no se discuten durante el hackathon. Si algo choca con ellas, gana este archivo.

## 1. Entrega
- **Cierre duro: domingo 15-11-2026 a las 23:59, hora de Concepción.** El juzgamiento local puede ser antes, así que hay que confirmarlo con la Local Lead.
- Todo lo que vea el jurado va **en inglés**: la UI, el README, la página Project y las slides. El código y los docs internos pueden ir en español.
- El link final es **público y sin login** (GitHub Pages más el repo público).
- La demo es un video de 30 s o menos, o hasta 7 slides.
- Hay que usar y citar al menos **un recurso de NASA** (HRP Hazards o Risks) para ser elegible al premio global.

## 2. Datos y salud
- **Solo datos simulados o públicos.** Nunca datos de una persona real.
- Cada umbral clínico (rango normal, alerta o crítico) **tiene una fuente citable** en `decisiones.md`. Si no hay fuente, el umbral no entra.
- La app **orienta, no diagnostica**. Ante un valor crítico, la acción siempre incluye "contactar a los flight surgeons".

## 3. Uso de IA (exigido por las bases)
- Hay que declarar dónde se usó IA: Claude Code, Codex y generación de imágenes.
- Las imágenes generadas con IA llevan **marca de agua visible**.
- El código asistido por IA se reconoce en el README y en los metadatos.
- Los commits van **sin** línea Co-Authored-By (regla de Sebastián). La declaración de IA vive en el README.

## 4. Código
- Stack: **Vite + React como PWA** (se instala en iOS y Android) y **Supabase Realtime** para conectar al astronauta con Tierra.
- **Bilingüe EN/ES.** La interfaz parte en inglés (para el jurado) y tiene un selector de idioma. Ningún texto queda escrito directo en los componentes: todo sale del diccionario de i18n.
- **Supabase:** se usa solo la clave pública (anon). Ninguna clave va en el repo: se cargan desde `.env.local`, que está en `.gitignore`. RLS queda activado en todas las tablas.
- **El dominio no depende de React.** Las reglas de evaluación (indicador → estado → acción) son funciones puras en `src/domain/` y se prueban sin interfaz.
- Ninguna abstracción entra si el prototipo no la necesita hoy.
- Accesibilidad mínima: el color nunca es la única señal (cada estado lleva ícono o texto) y el contraste cumple WCAG AA.

## 5. Proceso SDD
- Método del equipo, en 4 fases:
  1. Tres prototipos, uno por IA: Claude de Sebas, Claude de Miguel y ChatGPT de Camila.
  2. Las tres IAs debaten hasta llegar a una conclusión global.
  3. Prototipo final con las funciones clave.
  4. Presentación.
- **Este repo es el centro de integración.** Aquí se construye el prototipo de Sebas, aquí llega el contexto de los otros dos y aquí vive el final.
- Los tres prototipos parten del mismo `brief-prototipos.md` y respetan su contrato de datos. La interfaz es libre.
- Orden en cada fase: brief o spec aprobado → plan → implementación por bloques → verificación.
- `decisiones.md` es la **única fuente de verdad**. Lo que no está ahí, no está decidido.
- `harness.md` registra el estado. Se actualiza al cerrar cada bloque.
- Codex trabaja por bloques acotados. Su sandbox de escritura falla en este Windows, así que entrega archivos como bloques que después se aplican.
- Si hay que cortar alcance para llegar al cierre, se corta lo menos visible para el jurado y nunca la demo.
