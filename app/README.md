# App Frontend (Next.js)

Este directorio contiene la aplicacion Next.js. Para despliegues con Docker, ejecutar comandos desde la raiz del repositorio `paramascotasec/`.

## Comandos exactos

Desarrollo:

```bash
cd /home/admincenter/contenedores/paramascotasec
./scripts/deploy-development.sh
```

Produccion:

```bash
cd /home/admincenter/contenedores/paramascotasec
./scripts/deploy-production.sh
```

## Desarrollo (local)
Desde `paramascotasec/app`:

```bash
npm install
npm run dev
```

## Despliegue Docker en desarrollo
Desde `paramascotasec/`:

```bash
./scripts/deploy-development.sh
```

Servicio esperado: `paramascotasec-app-dev`.

## Despliegue Docker en produccion
Desde `paramascotasec/`:

```bash
./scripts/deploy-production.sh
```

Servicio esperado: `paramascotasec-app`.

Si prefieres cambiar por archivo:

```bash
docker compose --env-file .env.development up -d --build
docker compose --env-file .env up -d --build
```

En ambos casos `COMPOSE_PROFILES` del archivo debe coincidir con `APP_ENV`.

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
