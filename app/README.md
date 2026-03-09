# App Frontend (Next.js)

Este directorio contiene la aplicacion Next.js. Para despliegues con Docker, ejecutar comandos desde la raiz del repositorio `paramascotasec/`.

## Desarrollo (local)
Desde `paramascotasec/app`:

```bash
npm install
npm run dev
```

## Despliegue Docker en desarrollo
Desde `paramascotasec/`:

```bash
docker compose --profile development up -d --build
```

Servicio esperado: `paramascotasec-app-dev`.

## Despliegue Docker en produccion
Desde `paramascotasec/`:

```bash
docker compose --profile production up -d --build
```

Servicio esperado: `paramascotasec-app`.

## Logs y estado
Desde `paramascotasec/`:

```bash
docker compose ps
docker compose logs -f app-dev
```

En produccion:

```bash
docker compose logs -f app
```
