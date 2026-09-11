# GenChord: guia para agentes

GenChord es una herramienta web para estudiar acordes y teclado con rapidez: elegir un contexto musical, tocar una nota/grado y escuchar o visualizar el acorde resultante.

## Camino rapido

1. Lee `docs/product.md` para entender que problema resuelve.
2. Lee `docs/music-model.md` antes de tocar teoria musical.
3. Lee `docs/technical-direction.md` antes de proponer stack o arquitectura.
4. Lee `docs/ai-collaboration.md` antes de implementar cambios con IA.

## Mision

Ayudar a estudiantes y musicos a practicar acompanamiento: ver, escuchar y comparar acordes, inversiones, variaciones y registros antes de llevarlos al teclado real.

## Framing actual

| Tema                  | Estado                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Nombre                | `GenChord` recomendado como identidad de producto. `ChordGen` queda como alternativa mas generica. |
| Producto              | Study tool interactiva, no solo piano online ni generador aislado.                                 |
| Interaccion principal | El usuario elige tonalidad/modo/opciones y presiona nota, tecla o grado para disparar un acorde.   |
| Stack                 | Provisional. Ver `docs/technical-direction.md`.                                                    |

## Documentos

| Si vas a...                                | Lee / actualiza                         |
| ------------------------------------------ | --------------------------------------- |
| Cambiar alcance de producto                | `docs/product.md`                       |
| Modelar notas, escalas, grados o acordes   | `docs/music-model.md`                   |
| Elegir librerias, framework o arquitectura | `docs/technical-direction.md`           |
| Coordinar trabajo con IA                   | `docs/ai-collaboration.md`              |
| Implementar/revisar teoria musical         | `skills/music-theory-modeling/SKILL.md` |
| Implementar/revisar audio web              | `skills/audio-interaction/SKILL.md`     |
| Implementar/revisar UI de estudio          | `skills/ui-study-tool/SKILL.md`         |

## Skills del proyecto

| Trigger                                                        | Skill                                   |
| -------------------------------------------------------------- | --------------------------------------- |
| teoria musical, acordes, escalas, grados, inversiones          | `skills/music-theory-modeling/SKILL.md` |
| audio web, Web Audio, Tone.js, playback, latencia              | `skills/audio-interaction/SKILL.md`     |
| study tool UI, teclado, practica, visualizacion, accesibilidad | `skills/ui-study-tool/SKILL.md`         |

## Reglas de trabajo

- Mantené `AGENTS.md` como indice; mové detalle de dominio a `docs/`.
- Evitá decisiones definitivas de stack hasta que haya prototipo y constraints reales.
- Separá teoria musical, audio y UI: no mezcles reglas de acordes con componentes visuales ni playback.
- Preferí funciones puras para teoria musical; son mas testeables y menos fragiles.
- Preservá vocabulario musical consistente: nota, alteracion, tonalidad, escala/modo, grado, calidad, inversion, voicing, octava/registro.
- Actualizá docs junto con cambios importantes. Si el codigo contradice docs, una de las dos cosas esta mal.
