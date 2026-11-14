# NASA Space Apps 2026: contexto del equipo NutriVerso

Resumen propio de las bases oficiales. Leído el 2026-11-14 desde Gmail y spaceappschallenge.org.

## Evento
- Sede local: Concepción, Facultad de Ciencias Físicas y Matemáticas (UdeC).
- Sábado 14-11 de 08:30 a 21:00. A las 21:00 se cierran las puertas y nadie entra ni sale hasta las 08:00. Domingo 15-11 de 08:00 a 17:00.
- Sebastián llega cerca de las 13:00 el sábado (rotación clínica). La organización lo aprobó.
- **Entrega: se abre el sábado 14 a las 09:00 y se cierra el domingo 15 a las 23:59, hora de Concepción.** El juzgamiento local puede ser antes del cierre: hay que preguntarle a la Local Lead.

## Reto: "Create Health Monitoring Software for Astronauts on Space Missions"
URL: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/
Nivel intermedio. Temas: Human Exploration, Software, Space Exploration.

**Qué piden:** una herramienta *visual* con la que el astronauta registre indicadores de salud, evalúe su propio estado y reciba orientación para actuar (tratamiento o mejora).

**Contexto:** los 5 peligros del HRP de NASA son radiación, aislamiento y confinamiento, distancia a la Tierra, campos de gravedad y ambiente cerrado hostil. Causan cambios inmunes, pérdida ósea, eventos cardiovasculares, **nutrición inadecuada** y problemas de salud mental.

**Indicadores que sugieren:** presión arterial, frecuencia cardiaca, glucosa (mg/dL), temperatura, horas de sueño y ánimo. Se acepta cualquier dato que sea un indicador de salud, incluso imágenes como ecografías. Cualquier forma de ingreso sirve: teclado, clics o cámara.

**Preguntas que el reto invita a responder:**
- ¿Qué se puede medir en el espacio?
- ¿Por qué hace falta cada examen?
- ¿Cómo altera cada peligro un indicador?
- ¿Cuándo un valor amerita avisar a la tripulación o a los flight surgeons en Tierra?
- ¿Qué acciones previenen que el cuadro se vuelva crítico?

**Ideas opcionales que menciona:**
- Figura humana con partes clicables.
- Distintos entornos: nave, estación, rover o base planetaria.
- Recordatorios de medición dentro de la rutina.
- Gamificación.
- Gráficos de tendencia.
- Código de colores.
- Explicaciones simples, porque no se debe asumir que el astronauta sabe evaluarse.

**Recursos oficiales:**
- NASA HRP, 5 Hazards: https://www.nasa.gov/hrp/hazards/
- NASA HRP, Risks: https://www.nasa.gov/hrp/risks/
- NASA HRP, Ongoing research: https://www.nasa.gov/hrp/ongoing-hrp-research/
- CSA, monitoreo de radiación: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- CSA, ciencia en el espacio: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp

## Qué hay que entregar (página Project del equipo)
- **Todo en inglés.** Un video puede ir en otro idioma solo si lleva subtítulos en inglés.
- Nombre del proyecto y resumen de alto nivel: qué hicieron, cómo responde al reto y por qué importa.
- **Demo:** video de 30 s o menos, o hasta 7 diapositivas contando título e intro. Debe estar en un link público sin login (YouTube, Drive o GitHub).
- **Link al proyecto final:** público y sin login, por ejemplo un repo de GitHub o un sitio desplegado.
- Descripción detallada: qué hace, cómo funciona, beneficios, objetivo y herramientas usadas.
- **Uso de IA ("Super Intelligence"):** hay que declarar dónde se usó.
  - Imágenes y videos generados con IA llevan marca de agua visible.
  - Código y datos generados con IA se reconocen en el texto y en los metadatos.
  - Esto aplica a Claude y Codex.
- **NASA Data:** para optar a premio global hay que usar al menos un dato o recurso de NASA. Los recursos del HRP cuentan.
- Lista de todos los datos, recursos y herramientas usados.
- Equipo de 1 a 6 personas, todas inscritas en la misma sede local.

## Rúbrica (cada criterio de 1 a 5)
- Impact
- Creativity
- Validity
- Relevance
- Presentation (una buena demo sube este puntaje)

## Ofertas globales gratuitas (opcionales)
- Google Cloud y Firebase
- Microsoft Azure y GitHub Copilot
- GoDaddy: dominio y hosting
- Meteomatics
- Miro

## Decisiones fijadas
- Solo datos públicos o simulados. Sin datos de personas reales.
- Segundo asistente: Codex CLI.
- Ventaja del equipo: la nutrición es uno de los riesgos que nombra el propio reto, y NutriVerso es un equipo de Nutrición y Dietética.

## Material útil del Segundo Cerebro
- `03_RECURSOS/Nutricion/Guia_ADA_2026_Diagnostico_Diabetes_y_DMG.md`: umbrales de glucosa para definir rangos y colores. Hay que adaptarlos a adulto sano, no a diabetes gestacional.
- `03_RECURSOS/Nutricion/Protocolo_Atencion_Nutricional_INSC_16_Etapas.md`: secuencia anamnesis → evaluación → diagnóstico → intervención, útil como flujo de autoevaluación.
- `03_RECURSOS/Nutricion/Evidencia_IA_en_Nutricion_2026.md`: evidencia sobre estimar nutrientes desde fotos de comida.
- `03_RECURSOS/Alto_Rendimiento_y_Cognicion/Cadencia_de_Ejecucion_Idea_a_Artefacto.md`: tener un artefacto funcionando pronto antes que pulir la idea.
