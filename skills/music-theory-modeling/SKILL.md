---
name: music-theory-modeling
description: "Trigger: teoria musical, acordes, escalas, grados, inversiones. Implementa o revisa logica musical pura para GenChord."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

# Modelado de teoria musical

## Activation Contract

Usá este skill cuando implementes o revises notas, tonalidades, escalas, modos, grados, calidades de acorde, inversiones, voicings, octavas o notacion.

## Hard Rules

- Lee `docs/music-model.md` antes de cambiar logica teorica.
- Mantené funciones de teoria puras: sin DOM, sin estado React, sin objetos Web Audio.
- Distinguí escritura musical de pitch reproducible; C# y Db pueden sonar igual pero significar cosas distintas.
- Modelá grado y funcion en relacion con una tonalidad o modo; una nota absoluta no alcanza como contexto.
- Separá identidad del acorde, inversion y voicing.
- No expongas estructuras de una libreria externa por toda la app; envolvelas detras de una frontera local.

## Decision Gates

| Caso | Hacé |
|------|----|
| Nombrar notas | Respetá preferencia de notacion y contexto tonal. |
| Construir acordes | Devolvé datos musicales estables; UI/audio adaptan despues. |
| Agregar modos | Definí comportamiento de grados antes de sumar controles. |
| Usar `tonal.js` | Encerrá llamadas dentro de `music-core` o un adaptador. |

## Execution Steps

1. Identificá el contexto musical: tonalidad, escala/modo, notacion y registro.
2. Calculá notas, grado, calidad, inversion y voicing como pasos separados.
3. Agregá ejemplos o tests para enharmonia y casos borde en tonalidades menores.
4. Actualizá `docs/music-model.md` cuando cambien vocabulario o supuestos.

## Output Contract

Devolvé el comportamiento teorico cambiado, casos borde cubiertos y cualquier pregunta musical abierta.

## References

- `docs/music-model.md`
- `docs/technical-direction.md`
