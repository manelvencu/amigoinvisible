# 🎄 Amigo Invisible 2026

Invitación web navideña interactiva en azul noche y dorado. **Demostración pública**, sin datos reales.

## Estado
- Portada navideña con animaciones.
- Regalo interactivo que revela una asignación **ficticia**: Carlos → Marta.
- Publicación automática mediante GitHub Actions / GitHub Pages.
- Adaptada a móviles.

## Publicación
En **Settings → Pages → Build and deployment → Source** selecciona **GitHub Actions**. Cada cambio en `main` ejecuta el workflow `.github/workflows/deploy-pages.yml` y publica la web.

URL prevista, una vez activado Pages: https://manelvencu.github.io/amigoinvisible/

## Confidencialidad
⚠️ Este repositorio es público. **No incluir jamás listas de participantes, emails, asignaciones reales ni tokens** en archivos HTML, CSS o JS, en variables públicas o en el historial Git. La demostración actual no realiza sorteos ni identifica usuarios.

Para el sorteo real se necesitará un backend privado que genere y custodie las asignaciones y entregue cada resultado solamente a quien tenga su enlace secreto individual. GitHub Pages y GitHub Actions sirven para publicar el frontend, no para custodiar secretos.

No hay correos enviados desde este proyecto.
