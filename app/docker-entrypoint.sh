#!/bin/sh
set -e

# Instala dependencias si faltan o si el binario de Next no está disponible.
if [ ! -d /app/node_modules ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ] || [ ! -x /app/node_modules/.bin/next ]; then
  echo "node_modules incompleto o faltante; instalando dependencias dentro del contenedor..."
  npm ci
fi

exec "$@"
