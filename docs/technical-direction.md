# Direccion tecnica

La recomendacion inicial es TypeScript con una UI web moderna, un nucleo de teoria desacoplado y audio de navegador. Para el primer prototipo interactivo, el stack queda concretado como Vite + React + TypeScript, Vitest y Tone.js.

## Stack recomendado

| Area | Recomendacion provisional | Por que |
|------|---------------------------|---------|
| Lenguaje | TypeScript | Ayuda a modelar dominio musical sin perder velocidad. |
| UI | React con Vite | React encaja bien con visualizacion interactiva; Vite simplifica el prototipo sin sumar routing innecesario. |
| Audio | Web Audio API via Tone.js | Tone.js reduce friccion para scheduling, instrumentos simples y acordes. |
| Teoria musical | Nucleo propio minimo detras de `music-core` | Alcanza para triadas diatonicas en los 7 modos y evita acoplar la UI a una libreria externa antes de validar el modelo. |
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
- La teoria inicial cubre 12 raices cromaticas y los 7 modos diatonicos para triadas.
- El audio usa Tone.js detras de un adaptador: `Tone.start()` corre desde gestos explicitos del usuario, los reintentos siguen disponibles si el desbloqueo falla o queda suspendido, y una ruta de warm-up con `pointerup`/`click`/`keydown` ayuda a navegadores moviles a desbloquear audio desde eventos validos. Los instrumentos se preparan antes del primer gesto de reproduccion para que el fallback synth ya exista y `Tone.Sampler` pueda empezar a descargar muestras de piano sin bloquear el desbloqueo de autoplay. Un `Tone.Sampler` de piano se prefiere cuando las muestras estan listas y `PolySynth` queda como fallback si las muestras no estan disponibles o todavia no cargaron.
- La UI usa tokens CSS semanticos en `:root` para la paleta oscura actual; esto prepara el camino para tema claro/oscuro sin agregar todavia selector de tema.
- No se agrega `tonal.js` todavia; se reevalua cuando entren alteraciones teoricas completas, modos o voicings avanzados.

## Validacion local

- `npm run check` combina `npm run typecheck` y `npm test` para el mantenimiento del prototipo.
- No hay comando de lint configurado todavia y no se agregan dependencias de lint en esta etapa.

## Audio y muestras

- El sampler de piano carga muestras Salamander desde `https://tonejs.github.io/audio/salamander/`.
- Esa CDN es una dependencia externa de realismo sonoro; no debe bloquear el estudio si falla o tarda.
- Mientras el sampler no este listo, o si queda marcado como no disponible, el adaptador reproduce con `Tone.PolySynth`.
- La UI no debe conocer si suena sampler o synth: solo envia eventos musicales ya resueltos.
- El estado de desbloqueo de audio, los reintentos y los listeners de activacion movil viven dentro de la frontera del adaptador `audio`; los componentes UI solo piden playback o warm-up.

### Checklist manual de audio en navegador real

Ejecutar este chequeo en un navegador real, no solo en tests automatizados:

1. Abrir la app con audio bloqueado por autoplay, hacer el primer gesto del usuario y confirmar que el audio se desbloquea; si falla o queda suspendido, repetir el gesto y verificar que el reintento sigue disponible.
2. Probar con muestras cargadas y con muestras lentas/no disponibles: debe sonar sampler cuando este listo y `PolySynth` como fallback sin bloquear la UI.
3. Mantener dos notas o grados solapados, soltar uno y confirmar que solo se libera ese input; el otro debe seguir sonando hasta su propia liberacion.
4. Simular audio no disponible y confirmar que la app queda en modo visual usable, con feedback de error y sin romper la interaccion.
5. Evaluar respuesta percibida al disparar grados, teclas y drag-across: el sonido debe sentirse inmediato para estudio, aunque la medicion fina de latencia siga fuera de alcance.

## UI y theming

- La paleta visual actual vive como tokens CSS semanticos en `src/ui/styles.css`.
- El primer paso de theming es conservar el tema oscuro actual con variables reutilizables; tema claro/oscuro e i18n quedan para una etapa posterior.
- Los tokens priorizan superficies, texto, bordes, acentos, controles, teclado visual y estados activos/generadores.

## Despliegue

- El sitio publico esta en `https://ricardoumc.github.io/genchord/`.
- GitHub Pages se despliega desde `.github/workflows/deploy-pages.yml` en cada push a `main` y con disparo manual `workflow_dispatch`.
- El workflow usa `npm ci` y `npm run build`; el build combina typecheck de TypeScript y salida Vite en `dist`.
- `vite.config.ts` define `base: '/genchord/'` para que rutas y assets funcionen bajo GitHub Pages.

## Arquitectura sugerida

Separar tres capas desde el principio:

| Capa | Responsabilidad | No deberia saber de |
|------|-----------------|--------------------|
| `music-core` | Notas, escalas, grados, acordes, inversiones, voicings conceptuales | React, DOM, audio real |
| `audio` | Convertir eventos musicales en sonido reproducible | Componentes UI, decisiones pedagogicas |
| `ui` | Estado de estudio, teclado visual, controles, feedback | Detalles internos de audio o algoritmos teoricos |

## Criterio de decision

Primero validar experiencia: que presionar una tecla/grado sea inmediato, entendible y musicalmente correcto. Despues elegir stack final con evidencia, no por entusiasmo tecnologico.
