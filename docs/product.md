# Producto

GenChord es una herramienta web de estudio centrada en el teclado para explorar acompanamientos: elegis un contexto musical, disparas acordes desde notas/grados y ves/escuchas que esta pasando en el instrumento.

## Vision

Que estudiar acordes en teclado sea mas rapido, visual y auditivo, sin reemplazar la practica tecnica en un instrumento real.

## Usuario objetivo

| Usuario | Necesita |
|---------|----------|
| Estudiante de piano/teclado | Entender acordes, inversiones y digitaciones posibles antes de practicar. |
| Musico autodidacta | Probar progresiones y acompanamientos sin friccion teorica excesiva. |
| Productor/compositor | Audicionar colores armonicos rapido para llevar ideas a un DAW o instrumento. |

## MVP provisional

- Seleccionar tonalidad: nota raiz y mayor/menor.
- Usar el teclado visual como superficie principal de estudio.
- Tocar una tecla visual aunque no pertenezca al contexto: si puede resolver un acorde diatonico, dispara ese voicing; si no, suena y se resalta solo la nota individual.
- Tocar una tecla fisica o grado y disparar el acorde correspondiente dentro del contexto. El prototipo combina botones de grado con teclas absolutas del piano visual para estudiar la misma armonia desde dos entradas.
- Visualizar solo el voicing activo exacto en el teclado antes que tonos repetidos por todo el registro.
- Escuchar el acorde con sonido simple y respuesta rapida mientras se mantiene presionado el grado, tecla fisica o tecla visual.
- Usar voicings automaticos en posicion fundamental: los grados parten de C4 y las teclas visuales conservan el registro disparado; si el acorde excede C3-C6, se muestra y reproduce un voicing parcial con las notas disponibles.
- Automatic chords are enabled by default and can be toggled off with the visible control or the A shortcut; when disabled, degree and keyboard triggers play only the selected/root note even inside a scale context.
- Held inputs are polyphonic: overlapping degree, shortcut, and visual-keyboard triggers sustain independently until their own input is released.
- The active study result appears in a compact `Now Studying` strip directly above the keyboard so the player can read context, auto-chord state, range, and current result without looking below the instrument.
- Mostrar notacion basica en el modelo actual: nombres de nota tipo CDE, grados y numerales romanos segun calidad. Otras preferencias de notacion quedan para una etapa posterior.

## Jerarquia de experiencia

El teclado debe ser el elemento visual y funcional primario. Contexto, grados y resultado actual son configuracion de sonido/estudio alrededor del instrumento, no contenido tipo landing page ni bloques principales separados. The visible study flow should keep the active result above the keyboard: choose musical context → hold a degree or key → identify the chord or single tone in the `Now Studying` strip → see and hear the exact notes on the keyboard. Dentro del voicing activo, la nota generadora se diferencia ligeramente de las demas notas para conectar el disparador con el acorde resultante; cuando se toca una nota individual, esa tecla puede ser a la vez activa y generadora.

## Despues del MVP

- Modos y escalas alternativas.
- Variaciones de acordes: septimas, suspendidos, add, extensiones.
- Voicings orientados a acompanamiento.
- Controles explicitos de inversion, octava y registro.
- Preferencias para decidir si el teclado visual siempre toca notas individuales, intenta generar acordes contextuales o combina ambos comportamientos.
- Progresiones y ejercicios guiados.
- Preferencias de notacion mas avanzadas.

## No objetivos iniciales

- No ser un DAW.
- No reemplazar clases, tecnica ni practica con metronomo.
- No arrancar como libreria teorica generica para terceros.
- No priorizar realismo de piano por encima de claridad pedagogica.

## Decisiones resueltas en el prototipo

| Pregunta | Estado actual |
|----------|---------------|
| Grados, teclas absolutas o ambos | Resuelto para el MVP: conviven botones de grado, atajos fisicos y piano visual absoluto. |
| Notacion por defecto | Resuelto para el MVP: el modelo y la UI usan nombres tipo CDE, mas grados/numerales romanos. |

## Nombre

`GenChord` suena mas a producto e identidad. `ChordGen` describe una funcion, pero queda mas generico y menos memorable.

Decision actual: usar `GenChord` como nombre de trabajo, sin bloquear un cambio futuro si aparece una razon fuerte.
