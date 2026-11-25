# 🎄 Amigo Invisible 2026

Web navideña de sorteo secreto para **un único dispositivo compartido**, publicada mediante GitHub Pages y GitHub Actions.

## Cómo funciona

1. El administrador introduce un nombre por línea y confirma la lista de participantes (mínimo 2).
2. El navegador genera y guarda todas las asignaciones antes de empezar. Cada participante regala exactamente a uno distinto de sí mismo y cada destinatario recibe exactamente un regalo.
3. Cada participante selecciona su nombre de una lista de pendientes.
4. **Antes de revelar el resultado**, la web pregunta: «¿Estás solo, sin ninguna mirada indiscreta?». Si responde que no, vuelve a la lista sin consumir su turno.
5. Tras confirmar y pulsar «Abrir mi regalo», descubre el destinatario y queda marcado como completado.
6. Pulsa «Ocultar y pasar el dispositivo» para borrar el nombre de la pantalla. Los nombres completados desaparecen de la lista.
7. Cuando todos hayan participado, aparece una felicitación final.

## Privacidad y limitaciones

- Los nombres, el sorteo y el progreso **se almacenan únicamente en el almacenamiento local del navegador** (`localStorage`); no se envían a GitHub ni se incluyen en el código del repositorio.
- El sorteo se conserva si recargas la página, pero **no** se comparte entre navegadores o dispositivos. No uses modo incógnito ni borres los datos de navegación durante el juego.
- La selección del nombre y el botón de confirmación de soledad **no verifican la identidad**: el grupo debe respetar los turnos. Una persona con conocimientos técnicos y acceso al mismo navegador podría examinar las asignaciones guardadas. No es una solución de secreto criptográfico frente a los demás usuarios del dispositivo.
- El botón «Reiniciar sorteo (administrador)» requiere escribir `REINICIAR`, pero no existe un sistema de cuentas ni un PIN de administrador. Reiniciar elimina la partida local y su progreso.
- No se envían correos electrónicos.

## Publicación

El repositorio `manelvencu/amigoinvisible` mantiene el despliegue automático en la rama `main` con `.github/workflows/deploy-pages.yml`.

En **Settings → Pages → Build and deployment → Source**, seleccionar **GitHub Actions**.

URL de GitHub Pages: https://manelvencu.github.io/amigoinvisible/

## Pruebas

La lógica de sorteo y transición se verifica con pruebas locales que comprueban la ausencia de autorregalos y destinatarios repetidos, el aviso de privacidad, el registro del turno, la persistencia y el reinicio.
