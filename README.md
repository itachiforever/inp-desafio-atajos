# INP PLAY — Desafío de Atajos V18

Basado en la V17. Incluye ocho salas públicas, tres turnos por jugador y respuestas simétricas.

## Cambios V18
- Dado CSS 3D permanente, marfil con puntos fucsia; giro de 2,5 segundos con pequeño rebote.
- Detección de lanzamientos mediante `rollSeq` existente en el servidor, incluidos resultados consecutivos iguales.
- Las salas se cierran a nuevas incorporaciones al comenzar; las sesiones existentes pueden consultar el estado para reconectarse.
- Conserva el resto de la lógica de turnos y preguntas de la V17.
- Corregida selección de otro jugador para el resultado 3 (ID de texto).

## Despliegue
Sube el contenido de este ZIP a tu repositorio de GitHub y deja que Render despliegue el servicio Node.js. `npm start` inicia el servidor y `npm run check` comprueba la sintaxis.

## Nota de pruebas
Se han realizado comprobaciones automáticas de sintaxis y API; comprueba también la animación visual en móvil y escritorio antes de sustituir la versión publicada.


V18.3: Seis caras cerradas; profundidad translateZ con variable de semiarista explícita, sin división CSS. No se modifica la lógica de tiradas.


V18.4: corregida geometría del cubo, disposición de puntos de 1 a 6 y caché CSS/JS. No cambia servidor ni reglas.


## V18.5
Se consolidan los estilos del dado en una sola sección, eliminando las reglas 3D antiguas, filtros de escena y sombras de contenedor. Se corrige el estado angular acumulado del dado y se mantiene el contador rollSeq del servidor.
