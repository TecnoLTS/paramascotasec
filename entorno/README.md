# Entorno local

Este servicio lee configuracion solo desde `entorno/.env`.

- `entorno/.env.example` es la plantilla versionada.
- `entorno/.env` es local del servidor y no se versiona.
- `entorno/servidor.env` debe contener `ENTORNO_MODE=development` o `ENTORNO_MODE=production`.
- `entorno/.secrets/` guarda secretos runtime generados por el deploy.

Si falta `entorno/.env`, el deploy lo crea desde la plantilla y aborta para que completes valores reales.
