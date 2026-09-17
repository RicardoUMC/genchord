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
| MVP | Prototipo interactivo con tonalidad mayor/menor natural, disparo por grados y teclas visuales, teclado C3-C6, audio con sampler/fallback y voicing automatico. |
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
| App code | `true` |
| `package.json` | `true` |
| Test runner | `vitest` |
| Test command | `npm test` |
| Lint command | `none` |
| Typecheck command | `npm run typecheck` |
| Strict TDD | `false` |

La codebase actual usa Vite + React + TypeScript, Tone.js y Vitest. El build de produccion se ejecuta con `npm run build` y el deploy a GitHub Pages corre desde push a `main`.

## Proximo paso

Continuar evolucionando el prototipo desde evidencia real: inversiones, registro configurable, modos o voicings avanzados deben entrar como cambios acotados y testeables.
