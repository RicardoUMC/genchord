---
name: ui-study-tool
description: "Trigger: study tool UI, teclado, practica, visualizacion, accesibilidad. Implementa o revisa la UI de estudio de GenChord."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

# UI de herramienta de estudio

## Activation Contract

Usá este skill cuando implementes o revises la interfaz de estudio: teclado, controles, visualizacion de acordes, etiquetas, flujo de practica, responsive o accesibilidad.

## Hard Rules

- Diseñá para estudiar, no para decorar: cada elemento visual debe aclarar que tocar, escuchar o comparar.
- Mostrá el resultado musical en lenguaje del usuario: notas, grados, calidad, inversion y registro cuando aporte.
- Separá estado de UI de calculos teoricos e internos de playback.
- Hacé que el teclado funcione con mouse, touch y teclado fisico cuando sea practico.
- Cuidá mobile; controles apretados matan el flujo de practica.
- No escondas contexto musical importante detras de hover-only UI.

## Decision Gates

| Caso | Hacé |
|------|----|
| Mostrar un acorde | Mostrá nombre y notas componentes cuando sea posible. |
| Agregar controles | Preferí un set progresivo antes que todas las opciones teoricas juntas. |
| Vista de teclado | Priorizá notas activas legibles y registro actual. |
| Accesibilidad | Usá controles semanticos y estados de foco visibles. |

## Execution Steps

1. Partí de la tarea del estudiante: elegir contexto, disparar acorde, entender resultado.
2. Usá salidas del dominio directamente; no recalcules teoria dentro de componentes.
3. Conectá audio mediante una frontera de interaccion, no desde nodos de UI sueltos.
4. Actualizá `docs/product.md` si cambia el flujo de estudio.

## Output Contract

Devolvé el flujo de estudio afectado, feedback visual agregado y cualquier consideracion de accesibilidad.

## References

- `docs/product.md`
- `docs/music-model.md`
- `docs/ai-collaboration.md`
