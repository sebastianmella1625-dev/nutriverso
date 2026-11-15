# Prompt para las IAs de Miguel y Camila

**Instrucciones para Miguel y Camila:**
1. Pega el prompt de abajo **en la misma conversación donde tu IA construyó el prototipo**. Ahí tiene todo el contexto.
2. Si tu IA no ve los archivos del prototipo (por ejemplo, ChatGPT en una conversación nueva), primero súbele el .zip del código o las capturas, y después pega el prompt.
3. Cambia `[TU NOMBRE]` por tu nombre antes de enviarlo.
4. Tu IA te va a devolver **dos documentos**. Guárdalos como `ENTREGA.md` y `CONTEXTO_INTEGRACION.md` y envíaselos a Sebastián junto con el código (link de GitHub o .zip) y 3 a 5 capturas.

---

## PROMPT (copiar desde aquí)

Hola. Soy [TU NOMBRE], del equipo NutriVerso en la NASA Space Apps Challenge 2026, reto "Create Health Monitoring Software for Astronauts on Space Missions". La entrega final se cierra el domingo 15-11 a las 23:59 y se evalúa en inglés.

El equipo hizo 3 prototipos, cada uno con una IA distinta: tú hiciste el mío. Ahora vamos a juntar los 3 en un prototipo final. Para eso, la IA de Sebastián (Claude) va a leer lo que tú escribas, comparar los 3 prototipos con la rúbrica oficial (Impact, Creativity, Validity, Relevance, Presentation) y trasplantar las mejores ideas a una sola app.

**Tu tarea:** describir MI prototipo, el que construimos en esta conversación, en dos documentos Markdown, en español. Reglas:
- **No inventes nada.** Si no estás seguro de que algo funcione, márcalo como "no verificado". Si algo solo existe como idea o diseño, dilo.
- **Sé concreto:** nombra archivos, componentes, funciones, valores y fórmulas exactas. Nada de frases genéricas como "la UX es intuitiva".
- **No incluyas claves, contraseñas ni tokens.** Si el proyecto usa variables de entorno, escribe solo sus nombres.
- Si te falta información para completar algo (por ejemplo, no ves los archivos), pídemela antes de escribir.

### DOCUMENTO 1: `ENTREGA.md`
Completa exactamente esta plantilla:

```
# ENTREGA: prototipo de [TU NOMBRE]

## 1. Identidad
- Integrante:
- IA usada (modelo, si lo sabes):
- Link al código (repo o zip):
- Link en vivo (si está publicado):
- Horas invertidas (aprox.):

## 2. Concepto en una frase

## 3. Qué funciona de verdad (probado)
- [ ] Vista del astronauta: registrar indicadores de salud
- [ ] Vista del astronauta: ver su estado (semáforo o equivalente)
- [ ] Vista de Tierra / médico en tiempo real
- [ ] Mensajes de Tierra al astronauta
- [ ] Inglés y español
- [ ] Instalable en el celular (PWA o app)
- [ ] Datos: base real o simulados (indica cuál)
- Otras:

## 4. Qué NO funciona o quedó simulado

## 5. Umbrales clínicos usados
| Indicador | Normal | Alerta | Crítico | Fuente |
|---|---|---|---|---|

## 6. Uso de datos de NASA y otras fuentes

## 7. Las 3 mejores ideas de este prototipo
1.
2.
3.

## 8. Autoevaluación con la rúbrica oficial (1 a 5, con una línea de justificación)
| Criterio | Nota | Por qué |
|---|---|---|
| Impact | | |
| Creativity | | |
| Validity | | |
| Relevance | | |
| Presentation | | |
```

### DOCUMENTO 2: `CONTEXTO_INTEGRACION.md`
Sirve para que otra IA pueda llevarse partes de mi prototipo a la app final sin adivinar. Incluye estas secciones:

1. **Stack y cómo correrlo:** lenguaje, framework, versiones, dependencias principales, los comandos exactos para instalar y ejecutar, y los nombres de las variables de entorno (sin valores). Si es un diseño sin código (Figma, Canva, HTML suelto), dilo aquí.
2. **Mapa de archivos:** los archivos importantes, máximo 40 líneas, con una línea sobre qué hace cada uno.
3. **Modelo de datos:** qué datos guarda (entidades, campos y tipos) y cómo calza con este contrato común de la app final. Hazlo en una tabla: campo mío → campo del contrato, o "sin equivalente".
   ```
   readings(id, crew_id, indicator, value, unit, measured_at, source)
     indicator ∈ heart_rate, bp_systolic, bp_diastolic, glucose, body_temp,
                 sleep_hours, mood, water_ml, energy_kcal, protein_g, body_mass_kg
   messages(id, crew_id, from_role['crew'|'ground'], body, created_at, deliver_at)
   ```
4. **Funcionalidades:** una tabla con las columnas Funcionalidad | Qué hace | Dónde está (archivo o componente) | Estado (funciona / parcial / simulado / solo diseño).
5. **Lógica clínica exacta:** todas las reglas, fórmulas y cortes que usa para decidir estados o recomendaciones, con su fuente.
6. **Contenido reutilizable:** recomendaciones, textos educativos, preguntas y escalas, tal como están escritos en el prototipo.
7. **Recursos gráficos:** imágenes, íconos, animaciones o ilustraciones, su origen y si fueron generados con IA. Las bases exigen marca de agua en las imágenes hechas con IA.
8. **Lo que yo trasplantaría a la app final:** las 3 piezas más valiosas de este prototipo. Para cada una: por qué sube el puntaje ante el jurado, qué archivos involucra y cuántas horas tomaría rehacerla en otra app (Vite + React + TypeScript).
9. **Riesgos y errores conocidos.**

Entrégame los dos documentos completos, cada uno en su propio bloque de código Markdown, para poder copiarlos y guardarlos como archivos.

## FIN DEL PROMPT
