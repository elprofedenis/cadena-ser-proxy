CADENA SER ARGENTINA — PROXY DE AUDIO

Qué hace
--------
Este servicio recibe la transmisión fija de Cadena SER Argentina y la retransmite
desde un servidor propio con cabeceras CORS. Eso permite que una página HTML
pueda intentar conectar el audio al Web Audio API para activar vúmetro, ganancia,
compresor y limitador.

IMPORTANTE
----------
- Este proyecto no es el reproductor HTML: es el pequeño servicio que debe quedar
  alojado en internet.
- La URL de origen configurada es:
  https://server.laradio.online:58381/live
- Si esa transmisión cambia o deja de estar disponible, habrá que actualizarla.
- El alojamiento debe permitir conexiones HTTP de larga duración y suficiente
  transferencia de datos. Para una radio 24/7, un servicio gratuito que se duerme
  o limita ancho de banda probablemente no sea adecuado. El archivo render.yaml
  propone un servicio persistente de pago (Render Starter); revisá precio y límites
  actuales antes de desplegar.
- El proxy consume transferencia: si muchas personas escuchan, el tráfico puede
  ser considerable.
- No publiques un proxy genérico que acepte cualquier URL. Este código solo
  retransmite la emisora configurada.

Despliegue orientativo con Render
---------------------------------
1. Creá un repositorio en GitHub.
2. Subí a ese repositorio los archivos server.js, package.json y render.yaml.
3. En Render, elegí New > Blueprint y conectá ese repositorio.
4. Revisá el plan/costo y creá el servicio.
5. Cuando termine, Render te dará una URL parecida a:
   https://nombre-del-servicio.onrender.com
6. Abrí en el navegador:
   https://TU-SERVICIO.onrender.com/health
   Debe mostrar: Cadena SER proxy OK
7. Probá:
   https://TU-SERVICIO.onrender.com/stream
   El navegador debería comenzar a recibir audio. Si aparece texto de error, anotá
   el mensaje.

Conectar el reproductor HTML
----------------------------
En el HTML del reproductor, reemplazá la URL de la transmisión por la ruta /stream
del servicio que te dio el alojamiento. Ejemplo:
https://TU-SERVICIO.onrender.com/stream

No uses literalmente TU-SERVICIO: reemplazalo por el dominio real que te asignen.

Verificación final
------------------
Una vez conectado, comprobá que:
- el audio suene;
- el vúmetro se mueva;
- el compresor cambie perceptiblemente el nivel/dinámica;
- el volumen por encima de 100 % aumente el nivel sin distorsión excesiva.

Que el audio funcione no garantiza por sí solo que el procesamiento esté activo.
Si sigue apareciendo el mensaje de modo compatible, hay que comprobar las cabeceras
CORS del proxy y que el HTML esté usando la URL /stream, no la URL original.

Este proyecto es una plantilla técnica; no se ha desplegado ni probado en un
servidor público desde este paquete.
