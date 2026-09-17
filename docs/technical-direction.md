# Direccion tecnica

La recomendacion inicial es TypeScript con una UI web moderna, un nucleo de teoria desacoplado y audio de navegador. Para el primer prototipo interactivo, el stack queda concretado como Vite + React + TypeScript, Vitest y Tone.js.

## Stack recomendado

| Area | Recomendacion provisional | Por que |
|------|---------------------------|---------|
| Lenguaje | TypeScript | Ayuda a modelar dominio musical sin perder velocidad. |
| UI | React con Vite | React encaja bien con visualizacion interactiva; Vite simplifica el prototipo sin sumar routing innecesario. |
| Audio | Web Audio API via Tone.js | Tone.js reduce friccion para scheduling, instrumentos simples y acordes. |
| Teoria musical | Nucleo propio minimo detras de `music-core` | Alcanza para triadas mayor/menor natural del prototipo y evita acoplar la UI a una libreria externa antes de validar el modelo. |
| Tests | Vitest para teoria, UI y adaptador de audio | La teoria tiene reglas puras y debe ser confiable; UI/audio quedan cubiertos con pruebas ligeras. |

## Tradeoffs

| Decision | Ventaja | Riesgo |
|----------|---------|--------|
| Vite | Prototipo rapido, menos ceremonia | Si luego hace falta routing/contenido, puede requerir estructura extra. |
| Next.js | Buen marco para crecer | Puede ser mas framework del necesario para una herramienta principalmente interactiva. |
| Tone.js | Audio usable rapido | Puede ocultar detalles de Web Audio que importen para latencia fina. |
| tonal.js | Mucha teoria ya resuelta | Puede imponer nombres/modelos que no encajen con la pedagogia del producto. |
| Nucleo propio | Control total del vocabulario | Mas trabajo y mas riesgo de bugs teoricos. |

## Defaults del primer prototipo

- `music-core` es una frontera pura sin React, DOM ni audio.
- La teoria inicial cubre 12 raices mayores y 12 menores naturales para triadas diatonicas.
- Audio uses Tone.js through an audio adapter: `Tone.start()` still runs from explicit user gestures, a lightweight `Tone.Sampler` piano is preferred once samples load, and the existing `PolySynth` remains the fallback when samples are unavailable or not ready.
- No se agrega `tonal.js` todavia; se reevalua cuando entren alteraciones teoricas completas, modos o voicings avanzados.

## Arquitectura sugerida

Separar tres capas desde el principio:

| Capa | Responsabilidad | No deberia saber de |
|------|-----------------|--------------------|
| `music-core` | Notas, escalas, grados, acordes, inversiones, voicings conceptuales | React, DOM, audio real |
| `audio` | Convertir eventos musicales en sonido reproducible | Componentes UI, decisiones pedagogicas |
| `ui` | Estado de estudio, teclado visual, controles, feedback | Detalles internos de audio o algoritmos teoricos |

## Criterio de decision

Primero validar experiencia: que presionar una tecla/grado sea inmediato, entendible y musicalmente correcto. Despues elegir stack final con evidencia, no por entusiasmo tecnologico.
