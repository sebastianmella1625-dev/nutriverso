# Protocolo de debate entre las 3 IAs

Las tres IAs están en computadores distintos, así que no conversan en vivo. **El debate pasa por este repo:** cada ronda es un archivo y cada integrante le pasa a su IA lo que escribieron las otras dos.

## Entradas
- `prototipos/sebas/ENTREGA.md`
- `prototipos/miguel/ENTREGA.md`
- `prototipos/camila/ENTREGA.md`
- Las capturas de cada carpeta y `sdd/brief-prototipos.md`

## Ronda 1: evaluación cruzada (cada IA, por separado)
Cada integrante le pasa a su IA las **tres** ENTREGA.md y le pide que escriba `debate/r1-<nombre>.md` con:
1. Una nota de 1 a 5 por criterio (Impact, Creativity, Validity, Relevance, Presentation) **para cada prototipo, incluido el propio**, con una línea de justificación.
2. Las 3 ideas que **sí o sí** deben estar en el final, vengan del prototipo que vengan.
3. Los 2 riesgos principales: algo que el jurado podría castigar o que no alcanza a estar listo.

## Ronda 2: réplica (cada IA, por separado)
Cada IA lee las otras dos `r1-*.md` y escribe `debate/r2-<nombre>.md`:
- en qué cambia de opinión y por qué;
- con qué está en desacuerdo, citando el argumento contrario.

## Conclusión global (este entorno, Claude de Sebas)
Claude de Sebas consolida todo en `debate/CONCLUSION.md`:
- **Base del final:** el prototipo que se toma como esqueleto, elegido con las notas promedio y el costo de integrar.
- **Ideas que se incorporan** desde los otros dos, ordenadas por valor para el jurado ÷ horas.
- **Lo que se descarta**, con la razón.
- **Desacuerdos que no se resolvieron:** los decide Sebas, que es el humano a cargo.
- Lista corta de funciones finales, con su tiempo estimado.

Regla de desempate: gana lo que sube más el puntaje de la rúbrica por hora de trabajo restante. Si sigue empatado, decide Sebas.

## Formato
Español. Máximo una página por ronda y por IA. Afirmaciones verificables: "la vista Ground no actualiza sin recargar", no "la UX podría mejorar".
