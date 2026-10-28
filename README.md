# INP PLAY · Desafío de atajos multijugador

Juego educativo independiente para alumnos de Primaria, con salas compartidas desde diferentes dispositivos. Basado en las tarjetas de atajos de teclado utilizadas en INP Formación.

## Cómo se juega

1. Un participante crea una sala y comparte el código.
2. Los demás entran con su nombre y ese código.
3. El anfitrión inicia la partida (mínimo 2 participantes).
4. Cada participante dispone de **3 turnos**, en orden; cada acierto vale **1 punto**.
5. El dado decide la acción: **1** salta turno; **2** responde; **3** elige otro jugador para responder (el elegido gana los puntos); **4** responde e invierte el sentido; **5** doble reto (2 preguntas); **6** vuelve a tirar.
6. Al finalizar se muestra la clasificación.

## Probar en local

Se necesita Node.js 18 o superior.

```bash
npm start
```

Abre `http://localhost:3000` en dos navegadores para probar la sala.

## Publicar en GitHub y Render

1. En GitHub, abre el repositorio `itachiforever/inp-desafio-atajos`.
2. Sube **el contenido de esta carpeta**, no el ZIP de WordPress. En GitHub puedes usar `Add file` → `Upload files` y arrastrar los archivos y la carpeta `public`.
3. En Render, selecciona **New** → **Web Service**, conecta GitHub y selecciona este repositorio.
4. Configura: Runtime `Node`, Build Command `npm install`, Start Command `npm start`. Render proporciona el puerto mediante la variable `PORT`.
5. Abre la URL que Render asigne al servicio y prueba desde dos dispositivos.

## Alcance de esta prueba

Esta es una **versión piloto**: los estados de las salas se guardan en la memoria del proceso Node. Se pierden si Render reinicia o suspende el servicio; no admite varias réplicas simultáneas. La actualización de las pantallas se hace mediante consultas periódicas al servidor (aprox. 1,3 s). Para uso continuado habrá que añadir persistencia, reconexión más sólida y controles de administración. No contiene el plugin WordPress.


## V2 - Mejoras de prueba
- Banco ampliado a 72 preguntas; baraja única por sala sin repetir preguntas durante una partida.
- Dado visual CSS con seis caras y resultado visible. Se evita el mismo número en lanzamientos consecutivos como regla de prueba (no es un dado estrictamente aleatorio).
- Interfaz de juego más colorida.
- Tras actualizar GitHub, Render debe desplegar la nueva versión.


## V3 - Preguntas aportadas
Se añaden 30 preguntas del documento del docente (verdadero/falso y respuesta libre convertida a elección). En una misma partida se selecciona como máximo una pregunta por atajo para evitar repeticiones conceptuales.


## V4 - Recuperación de partidas
- Botón SALIR DE LA PARTIDA disponible en cualquier momento.
- Al detectar una sala caducada tras un reinicio de Render, se limpia la sesión y se vuelve al inicio.
- Salir desconecta la sesión de ese navegador, pero no elimina al jugador de una partida ya iniciada en el servidor. Para reiniciar completamente una sala, todos deben crear una nueva.


## V5 — Correcciones visuales y de animación
- El sondeo de sala ya no vuelve a renderizar la pantalla si el estado no ha cambiado: evita el zoom infinito del dado.
- Animación de giro 3D del dado al recibir un resultado nuevo.
- Diseño compacto, fluido y desplazamiento vertical interno del documento para evitar recortes del contenido del juego.
- En WordPress, establecer una altura suficiente para el iframe (recomendado: 1100px o 85vh con mínimo de 800px); si el tema impone una relación de aspecto al iframe, eliminarla.
