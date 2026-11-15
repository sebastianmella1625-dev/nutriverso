# Spec: prototipo final NutriVerso

Estado: **aprobado** por las decisiones D-41 a D-46 (14-11-2026, 23:45). Base: `prototipos/sebas/app` (spec-sebas.md sigue vigente). Lo que agrega este documento sale de Miguel (`prototipos/miguel/.../CONTEXTO_INTEGRACION.md` §5).

## Intención
Ganar en la sede de Concepción con un **pitch de 3 min + demo en vivo** en la que nada falle (D-45), y dejar lista la entrega global (link público, demo y página en inglés).

**Anti-objetivo:** agregar funciones que no estén probadas en el escenario real de la demo (celular + proyector, WiFi de la sede).

## Qué se agrega
1. **Metas NASA personalizadas (D-40, D-43a).** Fuente: NASA JSC-67378, Institute of Medicine 2005.
   - El perfil del tripulante suma sexo, edad, estatura y actividad (alta: PA 1,25).
   - Energía requerida = EER + 200 kcal × horas de EVA (promedio de los últimos 3 días). El EER se calcula así:
     - Hombres: 662 − 9,53·edad + PA·(15,9·kg + 539,6·m).
     - Mujeres: 354 − 6,91·edad + PA·(9,36·kg + 726·m).
   - Meta de líquidos = máx(32 mL × kg; 2500 mL hombres / 2100 mL mujeres).
   - Los umbrales de agua, energía y masa se recalculan contra estas metas (cortes exactos en el plan, Tarea F2).
2. **Niveles de acción + nivel de evidencia (D-43a).**
   - Cada estado distinto de ok se traduce en un **nivel de acción**:
     - **Notify flight surgeon now**: crítico en signos vitales o glucosa;
     - **Goes in the weekly report**: masa, sueño, ánimo, proteína o energía sostenidos;
     - **Self-care now**: el resto.
   - Cada umbral muestra su **nivel de evidencia**: strong / moderate / weak / team-defined.
3. **Informe para el médico (D-43b).** Resumen de 7 días (promedios, días en alerta y los ítems "avisar ya") que el astronauta envía con un toque. Viaja por el canal real con retardo y Ground lo ve formateado.
4. **Clima espacial NASA DONKI (D-43c).**
   - Tarjeta con los eventos de los últimos 7 días (SEP, CME, FLR, GST, RBE) desde `api.nasa.gov/DONKI/notifications`.
   - Si hay un evento SEP, sugiere ir al refugio con agua y comida.
   - **Caché**: máximo 1 consulta cada 30 min, último resultado guardado con su hora y aviso "datos de las HH:MM" si no hay red. La demo nunca muestra un error en blanco.
5. **Blindaje para la demo en vivo (D-45, D-46).**
   - Sala Supabase probada entre celular y computador.
   - Respaldo local probado.
   - Corregir los "menores" que se ven en vivo (banner que reaparece, contador de mensajes).
   - Prueba de carga.
   - Guion de demo ensayado.
6. **Estilo visual inspirado en Miguel** (D-42): solo si sobra tiempo, sin tocar la estructura.

## Fuera
Laboratorio, escáner de fotos y notificaciones push. Prensión + MyoShield entra solo si sobra tiempo (D-43).

## Dónde vive
`final/app/` es una copia de `prototipos/sebas/app/`. El prototipo de Sebas queda congelado con el tag `proto-sebas-v1`.
