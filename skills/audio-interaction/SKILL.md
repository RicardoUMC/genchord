---
name: audio-interaction
description: "Trigger: audio web, Web Audio, Tone.js, playback, latencia. Implementa o revisa interacciones sonoras de GenChord."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

# Interaccion de audio

## Activation Contract

Usá este skill cuando implementes o revises audio en navegador, reproduccion de acordes, scheduling, instrumentos, latencia o gestos de usuario.

## Hard Rules

- Tratá audio como adaptador: consume eventos musicales, no decide teoria.
- Respetá reglas de autoplay del navegador; inicializá audio desde un gesto explicito del usuario.
- Priorizá baja latencia sobre realismo instrumental complejo en el MVP.
- Mantené playback suficientemente deterministico para estudiar: sin timing aleatorio ni cambios ocultos de voicing.
- Ofrecé fallo elegante si audio no puede iniciar; el flujo visual de estudio debe seguir funcionando.
- Evitá filtrar objetos de Tone.js o Web Audio hacia UI y teoria.

## Decision Gates

| Caso | Hacé |
|------|----|
| Primer prototipo | Usá un synth o sampler simple con ataque claro. |
| Disparo de acorde | Programá notas juntas salvo que la feature pida arpegio. |
| Problema de latencia | Medí el camino de interaccion antes de sumar abstracciones. |
| Audio no disponible | Mantené visualizacion y etiquetas usables. |

## Execution Steps

1. Recibí notas o pitches normalizados desde la capa de dominio.
2. Iniciá o reanudá el contexto de audio desde una accion del usuario.
3. Dispará playback con scheduling minimo y duracion predecible.
4. Documentá supuestos de audio en `docs/technical-direction.md` si cambian.

## Output Contract

Devolvé que interaccion suena, como arranca audio y que fallback existe.

## References

- `docs/technical-direction.md`
- `docs/ai-collaboration.md`
