# GenChord SDD Context

GenChord usa SDD en modo hibrido: los artefactos revisables viven en `openspec/` y los descubrimientos operativos se persisten en Engram.

## Camino rapido

1. Lee `AGENTS.md` para elegir el documento o skill correcto.
2. Lee `docs/product.md` antes de cambiar alcance de producto.
3. Lee `docs/music-model.md` antes de tocar teoria musical.
4. Lee `docs/technical-direction.md` antes de proponer stack o arquitectura.
5. Lee `docs/ai-collaboration.md` antes de implementar con IA.

## Producto

| Tema | Decision actual |
|---|---|
| Identidad | `GenChord` como nombre de trabajo. |
| Mision | Herramienta web de estudio para elegir contexto musical, disparar acordes desde notas/grados y ver/escuchar el resultado. |
| MVP | Tonalidad mayor/menor, disparo de acordes, teclado visual, audio simple, inversiones y octava/registro. |
| Fuera de alcance inicial | No DAW, no reemplazo de practica tecnica, no libreria teorica generica para terceros. |

## Arquitectura

| Capa | Responsabilidad | Limite |
|---|---|---|
| `music-core` | Notas, escalas, grados, acordes, inversiones y voicings conceptuales. | No React, DOM ni audio real. |
| `audio` | Playback de eventos musicales ya resueltos. | No reglas teoricas ni decisiones pedagogicas. |
| `ui` | Estado de estudio, teclado visual, controles y feedback. | No algoritmos teoricos ni detalles internos de audio. |

## Testing actual

| Capability | Estado |
|---|---|
| App code | `false` |
| `package.json` | `false` |
| Test runner | `none` |
| Test command | `none` |
| Lint command | `none` |
| Typecheck command | `none` |
| Strict TDD | `false` |

Motivo: todavia no hay codebase ni runner; activar TDD estricto despues de scaffold inicial.

## Proximo paso

Usar `/sdd-new` o `/sdd-ff` para definir el primer prototipo interactivo antes de fijar stack definitivo.
