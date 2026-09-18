# Modelo musical inicial

Este modelo define el vocabulario base. El primer prototipo ya fija un subconjunto practico para validar la experiencia: triadas diatonicas en mayor y menor natural sobre 12 raices cromaticas, inversion fundamental y voicing cerrado automatico no configurable.

## Conceptos principales

| Concepto | Que significa aca |
|----------|-------------------|
| Nota | Altura nombrada, por ejemplo C, D, E o Do, Re, Mi. |
| Alteracion | Cambio sobre una nota natural: sostenido, bemol, becuadro si hace falta. |
| Tonalidad | Centro tonal elegido por el usuario, por ejemplo C mayor o A menor. |
| Escala / modo | Conjunto ordenado de grados disponible dentro de un contexto. Mayor/menor primero; modos despues. |
| Grado | Posicion relativa en la escala: I, ii, iii o 1, 2, 3 segun notacion. |
| Calidad de acorde | Tipo armonico: mayor, menor, disminuido, aumentado, dominante, suspendido, etc. |
| Inversion | Que nota del acorde queda abajo: fundamental, tercera, quinta, septima. |
| Voicing | Distribucion real de las notas: cerrado, abierto, duplicaciones, omisiones. |
| Nota generadora | Nota del voicing que actua como raiz/disparador contextual del acorde activo. |
| Octava / registro | Zona del teclado donde se ubica o dispara el acorde. |
| Sistema de notacion | Como se muestran notas y grados: ingles CDE, latino Do Re Mi, sostenidos/bemoles, numeros romanos. |

## Estado implementado del prototipo

- El MVP trabaja con botones de grado y con teclas absolutas del piano visual C3-C6.
- La notacion implementada es de nombres tipo CDE para notas, mas grados/numerales romanos para funcion armonica.
- Las teclas visuales pueden resolver acordes contextuales o sonar como nota individual si no hay acorde diatonico aplicable.

## Flujo mental

1. El usuario elige una tonalidad y una escala/modo.
2. El usuario presiona una nota, tecla o grado.
3. El sistema interpreta esa entrada dentro del contexto musical.
4. El sistema resuelve calidad, notas, inversion, voicing y registro.
5. Si la entrada no puede resolver un acorde contextual, el sistema conserva la tecla como nota individual reproducible.
6. La UI visualiza el resultado y el audio lo reproduce.

## Reglas iniciales

- Una misma altura puede tener nombres distintos: C# y Db no siempre son intercambiables en notacion.
- La teoria debe distinguir nombre musical de sonido reproducible.
- Los grados dependen del contexto; una nota suelta no alcanza para saber su funcion armonica.
- Las inversiones cambian el bajo, no necesariamente la identidad del acorde.
- El voicing pertenece al uso practico en teclado; no conviene mezclarlo con la definicion abstracta del acorde.
- El prototipo usa numerales romanos sensibles a calidad: mayor en mayuscula (`I`), menor en minuscula (`ii`) y disminuido con simbolo de grado (`vii°`, `ii°`).
- Menor inicial significa menor natural. Menor armonica y melodica quedan fuera del primer prototipo.
- La visualizacion de teclado resalta solo tonos del acorde activo; no resalta escala completa ni grados disponibles.
- La visualizacion de teclado resalta solo las notas exactas del voicing activo, no cada repeticion de la misma clase de altura entre C3-C6; dentro de ese voicing, la nota generadora lleva un acento visual propio.
- Los acordes disparados por grados usan por defecto un voicing ascendente desde el registro C4 en adelante; si una triada cruza C, la nota superior sube a la siguiente octava.
- Las restricciones de escala/contexto aplican a los grados. El teclado visual es permisivo: una tecla diatonica puede disparar el grado contextual correspondiente; una tecla fuera de escala o sin contexto sigue sonando como nota individual y se resalta sola.
- Si una tecla visual diatonica alta haria que la triada salga de C3-C6, el sistema no reubica el acorde a una octava inferior: conserva el registro disparado y reproduce/muestra solo las notas del voicing que existen dentro del teclado visible.
- La escritura del prototipo evita dobles alteraciones y nombres como `E#`, `B#`, `Cb` o `Fb`; esas decisiones quedan para una capa de notacion mas completa.

## Modos diatónicos

| Modo griego | Nombre práctico | Patrón de intervalos | Acordes triada diatónicos | Numerales romanos |
|-------------|-----------------|---------------------|---------------------------|-------------------|
| Ionian | Major | W-W-H-W-W-W-H | M-m-m-M-M-m-dim | I, ii, iii, IV, V, vi, vii° |
| Dorian | — | W-H-W-W-W-H-W | m-m-M-M-m-dim-M | i, ii, III, IV, v, vi°, VII |
| Phrygian | — | H-W-W-W-H-W-W | m-M-M-m-dim-M-m | i, II, III, iv, v°, VI, vii |
| Lydian | — | W-W-W-H-W-W-H | M-M-m-dim-M-m-m | I, II, iii, iv°, V, vi, vii |
| Mixolydian | — | W-W-H-W-W-H-W | M-m-dim-M-m-m-M | I, ii, iii°, IV, v, vi, VII |
| Aeolian | Natural Minor | W-H-W-W-H-W-W | m-dim-M-m-m-M-M | i, ii°, III, iv, v, VI, VII |
| Locrian | — | H-W-W-H-W-W-W | dim-M-m-m-M-M-m | i°, II, iii, iv, V, VI, vii |

**Notas de implementación:**
- Los modos son rotaciones de la escala mayor; comparten el sistema de alturas cromáticas pero cambian el centro tonal (tonic) y las funciones armónicas de cada grado.
- Cada modo tiene su propio conjunto de calidades diatónicas y numerales romanos sensibles a calidad.
- El sistema de notación continúa usando nombres tipo CDE más numerales romanos.
- En la UI, cada modo se muestra con ambos nombres: griego + práctico cuando aplica (ej: "Ionian (Major)", "Aeolian (Natural Minor)", "Dorian").

## Preguntas abiertas

- Resuelto para el MVP: el sistema de notacion por defecto es CDE; Do Re Mi queda como preferencia futura.
- Resuelto para el MVP: modos diatónicos son la siguiente feature prioritria.
- Como nombrar alteraciones segun tonalidad para evitar resultados teoricamente raros.
- Resuelto para el MVP: permite ambos, con botones de grado y teclas absolutas del piano visual.
- Que configuracion futura deberia controlar si el teclado visual prioriza nota individual, generacion de acorde contextual o comportamiento combinado.
