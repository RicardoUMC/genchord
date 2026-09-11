# GenChord

GenChord es una herramienta web para estudiar acordes en teclado de forma rápida, visual y auditiva. Permite elegir una tonalidad, disparar acordes diatónicos por grado y ver qué notas se tocarían antes de pasar al instrumento real.

## Estado actual

Primer prototipo interactivo:

- Selección de tonalidad: raíz + modo mayor/menor natural.
- Disparo de acordes por grados diatónicos.
- Visualización del acorde: grado, nombre y notas.
- Teclado visual con notas del acorde resaltadas.
- Reproducción simple con Tone.js.
- Tests para teoría musical, UI y adaptador de audio.

## Inicio rápido

```bash
npm install
npm run dev
```

La app queda disponible en:

```txt
http://localhost:5173/
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo con Vite. |
| `npm run build` | Ejecuta typecheck y genera el build de producción. |
| `npm run typecheck` | Verifica tipos de TypeScript sin emitir archivos. |
| `npm test` | Ejecuta la suite de tests con Vitest. |

## Arquitectura

El prototipo separa la aplicación en tres capas:

| Capa | Responsabilidad |
|---|---|
| `src/music-core` | Reglas musicales puras: tonalidades, grados y triadas diatónicas. |
| `src/audio` | Reproducción de acordes con Tone.js. |
| `src/ui` | Componentes React, estado de estudio y visualización. |

La regla principal es simple: la teoría musical no debe depender de React, DOM ni Web Audio.

## Alcance del prototipo

Incluido:

- 12 tonalidades mayores.
- 12 tonalidades menores naturales.
- Triadas diatónicas.
- Cifrado romano básico: mayor en mayúscula, menor en minúscula y disminuido con `°`.

Fuera de alcance por ahora:

- Modos y escalas alternativas.
- Séptimas, suspendidos, acordes `add` y extensiones.
- Inversiones y voicings configurables.
- Progresiones guardadas.
- Notación avanzada como `Cb`, `Fb`, `E#`, `B#` o dobles alteraciones.
- Medición fina de latencia en navegador.

## Documentación del proyecto

| Archivo | Propósito |
|---|---|
| `AGENTS.md` | Índice para agentes y reglas generales de trabajo. |
| `docs/product.md` | Visión de producto, usuarios objetivo y alcance. |
| `docs/music-model.md` | Modelo conceptual de teoría musical. |
| `docs/technical-direction.md` | Dirección técnica y tradeoffs. |
| `docs/ai-collaboration.md` | Reglas para colaboración con agentes de IA. |
| `openspec/` | Artefactos SDD: specs activas y cambios archivados. |

## Stack

- TypeScript
- React
- Vite
- Tone.js
- Vitest
- React Testing Library

## Próximos pasos

- Probar la experiencia en navegador y ajustar la interacción.
- Agregar inversiones y control de registro/octava.
- Evaluar modos, séptimas y voicings orientados a acompañamiento.
- Revisar si conviene incorporar `tonal.js` cuando el modelo musical crezca.
