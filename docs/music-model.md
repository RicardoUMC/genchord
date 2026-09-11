# Modelo musical inicial

Este modelo define el vocabulario base. El primer prototipo ya fija un subconjunto practico para validar la experiencia: triadas diatonicas en mayor y menor natural sobre 12 raices cromaticas, sin inversiones ni voicings configurables.

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
| Octava / registro | Zona del teclado donde se ubica o dispara el acorde. |
| Sistema de notacion | Como se muestran notas y grados: ingles CDE, latino Do Re Mi, sostenidos/bemoles, numeros romanos. |

## Flujo mental

1. El usuario elige una tonalidad y una escala/modo.
2. El usuario presiona una nota, tecla o grado.
3. El sistema interpreta esa entrada dentro del contexto musical.
4. El sistema resuelve calidad, notas, inversion, voicing y registro.
5. La UI visualiza el resultado y el audio lo reproduce.

## Reglas iniciales

- Una misma altura puede tener nombres distintos: C# y Db no siempre son intercambiables en notacion.
- La teoria debe distinguir nombre musical de sonido reproducible.
- Los grados dependen del contexto; una nota suelta no alcanza para saber su funcion armonica.
- Las inversiones cambian el bajo, no necesariamente la identidad del acorde.
- El voicing pertenece al uso practico en teclado; no conviene mezclarlo con la definicion abstracta del acorde.
- El prototipo usa numerales romanos sensibles a calidad: mayor en mayuscula (`I`), menor en minuscula (`ii`) y disminuido con simbolo de grado (`vii°`, `ii°`).
- Menor inicial significa menor natural. Menor armonica y melodica quedan fuera del primer prototipo.
- La visualizacion de teclado resalta solo tonos del acorde activo; no resalta escala completa ni grados disponibles.
- La escritura del prototipo evita dobles alteraciones y nombres como `E#`, `B#`, `Cb` o `Fb`; esas decisiones quedan para una capa de notacion mas completa.

## Preguntas abiertas

- Que sistema de notacion se usa por defecto: CDE o Do Re Mi.
- Si menor armonica, menor melodica o modos deben ser opciones configurables despues del MVP.
- Como nombrar alteraciones segun tonalidad para evitar resultados teoricamente raros.
- Si el primer MVP trabaja por grados, por teclas absolutas o permite ambos.
