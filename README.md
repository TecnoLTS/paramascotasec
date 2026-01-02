# Stack dockerizado (multi Next.js)

`docker compose` en este directorio levanta todo: PostgreSQL, dos apps Next.js y el gateway Nginx sobre la red interna `edge`. Las apps usan la imagen base `node:20-alpine` y sincronizan dependencias en el arranque (puede tomar un par de minutos la primera vez).

## Servicios
- `db`: Postgres 16 (datos en `../paramascostas-DB/postgres_data`).
- `paramascotas-app`: la app principal (puerto host 3000 opcional).
- `example-app`: Next.js de ejemplo para `example.com/ejemplo.com` (puerto host 3001).
- `gateway`: Nginx frontal que enruta por dominio.

## Accesos y hosts
Añade a `/etc/hosts` (o equivalente):
```
127.0.0.1 paramascotasec.com www.paramascotasec.com
127.0.0.1 example.com www.example.com ejemplo.com www.ejemplo.com
```
- Principal: `https://paramascotasec.com` (gateway) o `http://localhost:3000` directo.
- Ejemplo: `https://example.com` / `https://ejemplo.com` (gateway) o `http://localhost:3001` directo.

## Uso rápido
1) En `next-test`: `docker compose up -d` (sin `--build`; las apps ya usan la imagen base).
2) Detener: `docker compose down` (añade `-v` solo si quieres borrar la base).

## Logs y mantenimiento
- Ver logs: `docker compose logs -f paramascotas-app example-app gateway db`
- Reconstruir solo una app: `docker compose build paramascotas-app` (o `example-app`).
- Credenciales DB: usuario `postgres`, password `postgres`, base `paramascotasec` (configurable en `docker-compose.yml`).

## Notas
- El Nginx interno de `next-test/nginx` sigue obsoleto; todo pasa por `gateway/conf.d/default.conf`.
- Para añadir otra app Next.js, copia la estructura de `example-app`, crea un nuevo servicio en `docker-compose.yml` (puerto distinto) y agrega un `server` block en `gateway/conf.d/default.conf` apuntando a ese contenedor.








----------------------------Docker----------------------------------
------------Reiniciar
docker compose restart

------------Detener
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true

------------Eliminar
docker rm -f $(docker ps -aq)
docker rmi -f $(docker images -q)

------------Limpiar
sudo docker volume prune -f
sudo docker builder prune -af
sudo docker system prune -af

------------Levantar
sudo docker compose up -d --build

----------------------------Permisos----------------------------------
sudo chown -R $(whoami):$(whoami) /opt

sudo chown -R 999:999 pgdata
sudo chmod 700 pgdata
sudo chown -R $USER:$USER /opt/mascotasDB
chmod -R 777 /opt/mascotasDB


------------Borrar carpeta
rm -rf ./mascotasDB

------------Crear carpeta
mkdir -p pgdata


------------Clomar repositorio
git clone https://github.com/Evasquez09/mascotasDB.git
git clone https://github.com/Evasquez09/mascotasDB.git
git clone https://github.com/Dnavas-28/next-test.git
git clone https://github.com/Dnavas-28/gateway.git



Evasquez09
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

Dnavas - Evasquez09
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

----------------------------Limpiar todo Docker----------------------------------
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm -f $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rmi -f $(sudo docker images -q) 2>/dev/null || true
sudo docker volume prune -f
sudo docker builder prune -af
sudo docker system prune -af --volumes
sudo docker network prune -f





sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker volume prune -f
sudo docker builder prune -af
sudo docker system prune -af --volumes
sudo docker network prune -f
sudo docker compose up -d --build



git log --oneline --decorate -10
git reset --hard 361ec1c
git push origin main --force
git log --oneline --decorate -3
git status




