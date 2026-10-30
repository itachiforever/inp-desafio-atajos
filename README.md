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

## V18.6
Prueba de orientación de caras 3 y 4 siguiendo la propuesta externa; sin cambios en las reglas del juego.

## V18.7
Caras cuadradas para eliminar aberturas en esquinas; profundidad mediante `calc(var(--edge) * 0.5)`. Animación y lógica sin cambios.

## V18.8
Acabado Premium brillante del dado: marfil perlado con luces y sombras por cara y puntos fucsias con relieve. Se conservan las esquinas cuadradas, la geometría y el giro de 2,5 segundos. Solo cambia `public/style.css` y el parámetro de caché en `public/index.html`; `app.js` y `server.js` no se modifican.

## V18.9
Se dibujan las seis caras con colores marfil planos, aristas cuadradas y nítidas y puntos fucsias definidos. Se retiran degradados y sombras difusas del acabado V18.8. No se modifica la geometría ni la animación; `app.js` y `server.js` permanecen idénticos.

## V18.10
Integración de las seis caras Arcade vectoriales SVG en el dado 3D, con marcos fucsias y cian, esquinas negras y amarillas, y puntos fucsias del 1 al 6. Sin cambios en la animación de 2,5 segundos ni en la lógica del juego.


### V18.11 — Corrección de carga de caras Arcade
Se cierran dos bloques `@media` del CSS que impedían aplicar los SVG del dado en pantallas normales. Se conservan los seis SVG y la animación sin modificar el juego.


## V18.12 — Corrección de caras Arcade visibles
- Los seis SVG se incrustan en `public/style.css` como imágenes base64 para evitar errores de carga o rutas en Render/WordPress.
- Se mantienen los archivos SVG originales en `public/dice/`.
- Sin cambios en `public/app.js` ni en `server.js`; animación y mecánica intactas.


### V18.13 — Sincronización visual y avance automático
- Durante los 2,5 segundos de giro, oculta etiqueta y acciones; al detenerse muestra el resultado.
- Tras una respuesta, conserva la corrección visible y avanza automáticamente después de 3 segundos desde el navegador del jugador activo.
- Sustituye la espera vacía por mensajes de transición.
- Ajusta el fondo y las aristas del dado Arcade para reducir el reborde claro.
- No modifica `server.js`, las reglas, las salas ni el sistema de puntuación.
