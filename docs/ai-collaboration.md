# Colaboracion con IA

La IA en GenChord debe cuidar el modelo musical y mantener separadas teoria, audio y UI. Rapidez si, pero sin mezclar conceptos: ahi nacen los bugs dificiles.

## Reglas base

- Leé `AGENTS.md` antes de arrancar una tarea.
- Actualizá docs cuando cambie producto, dominio o direccion tecnica.
- No conviertas recomendaciones provisionales en decisiones finales sin evidencia.
- Preservá vocabulario musical consistente: nota, alteracion, tonalidad, modo, grado, calidad, inversion, voicing, octava/registro.
- Preferí funciones puras para teoria musical; deben poder testearse sin navegador ni audio.
- No acoples UI, audio y teoria. Si una funcion necesita DOM o audio para calcular un acorde, esta mal ubicada.

## Antes de implementar

| Si vas a tocar... | Verifica primero |
|-------------------|------------------|
| Teoria musical | `docs/music-model.md` y `skills/music-theory-modeling/SKILL.md` |
| Playback o audio | `skills/audio-interaction/SKILL.md` |
| Interfaz de estudio | `skills/ui-study-tool/SKILL.md` |
| Stack o dependencias | `docs/technical-direction.md` |

## Criterios de calidad

- La UI debe explicar que esta sonando, no solo reproducirlo.
- El audio debe responder rapido y no bloquear el aprendizaje.
- El dominio debe distinguir enharmonia, funcion armonica y sonido reproducible.
- Los nombres visibles al usuario deben ser pedagogicos, no accidentes de una libreria.

## Cuando haya dudas

Documentá la pregunta abierta en el doc correspondiente y seguí con la decision reversible mas chica. No sobredisenees antes de probar la interaccion real.
