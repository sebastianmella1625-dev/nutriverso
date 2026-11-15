# Guion de la demo en vivo: NutriVerso (pitch de 3 min + demo)

**Links:**
- Astronauta (celular): `https://sebastianmella1625-dev.github.io/nutriverso/?room=demo#/crew`
- Tierra (proyector): `https://sebastianmella1625-dev.github.io/nutriverso/?room=demo#/ground`
- **Plan B sin internet:** abre las mismas dos rutas **sin `?room=demo`** en el mismo computador, en dos ventanas lado a lado. Funcionan en modo local, sin red.

## Checklist 30 min antes
- [ ] En Supabase → SQL Editor: corre `final/supabase/seed-demo.sql` para dejar la sala limpia. Antes, regénéralo con `npm run seed -- demo` dentro de `final/app`, así las fechas quedan al día.
- [ ] Celular: abre el link de Crew en Chrome (Android) o Safari (iOS) y agrégalo a la pantalla de inicio, para que se vea como app. Brillo al máximo y sin ahorro de batería.
- [ ] Computador: abre el link de Ground y sube el zoom del navegador para el proyector.
- [ ] Idioma en **English**: el jurado evalúa en inglés.
- [ ] Ensayo completo una vez con el cronómetro. En Ground, la "Accelerated demo" debe estar activa (12 min = 12 s).
- [ ] Deja abiertas las dos ventanas del plan B, minimizadas.

## Demo (unos 90 s dentro del pitch)
| s | Quién / dónde | Qué se muestra | Qué se dice (idea, no texto literal) |
|---|---|---|---|
| 0–15 | Celular (Crew) | La figura de Miguel: **Bone** y **Muscle** en alerta | En Marte el médico está a 3–22 minutos. El astronauta tiene que evaluarse solo. |
| 15–35 | Celular → toca la pierna | Detalle de Bone: agua 1690 mL frente a la **meta NASA** de 2500, chip **"Self-care now"** y fuente con nivel de evidencia | Nutrición dentro de los semáforos, con metas NASA JSC-67378 calculadas para su cuerpo. |
| 35–45 | Celular | Tarjeta **NASA DONKI** con datos vivos de esta semana | Datos reales de NASA: el clima espacial afecta la radiación que recibe la tripulación. |
| 45–60 | Celular → Mensajes → **Send weekly report** | "Report sent · arrives in 12 s" | Lo que no es urgente va en el informe semanal, no se interrumpe a Tierra. |
| 60–75 | Proyector (Ground) | "Incoming from crew…", luego el informe y el banner | Tierra ve a la tripulación ordenada por gravedad. |
| 75–90 | Proyector → **Send** (sugerencia precargada) → Celular | El mensaje en tránsito y luego entregado | El retardo de Marte es real, lo aceleramos solo para la demo. |

## Si algo falla
- **No carga el link o se cae la WiFi:** dilo con calma ("la red de la sede; esto es justamente lo que vive un astronauta") y cambia al plan B.
- **Un mensaje no llega:** recarga la pestaña. La app se pone al día sola al volver a primer plano.
- **DONKI no responde:** la tarjeta muestra el último dato guardado con su hora. Es comportamiento esperado: nunca queda en blanco.

## Qué NO decir (Validity)
- No decir que diagnostica: **"orienta, no diagnostica"**.
- No mostrar como terminado lo que no lo está: escáner de fotos, notificaciones push, laboratorio.
- Los datos son **simulados**, y Miguel y Camila son nombres de tripulantes ficticios.

## Respaldo por criterio de la rúbrica
- **Impact:** autonomía en misiones largas; dice cuándo avisar a Tierra.
- **Creativity:** nutrición dentro de los sistemas, retardo de Marte como experiencia y clima espacial vivo.
- **Validity:** metas NASA JSC-67378, AHA y ADA, nivel de evidencia por umbral y 161 tests.
- **Relevance:** los 6 indicadores del reto, peligros de NASA HRP, colores, tendencias, gamificación y Tierra.
- **Presentation:** PWA instalable, bilingüe y en vivo entre dos dispositivos.
