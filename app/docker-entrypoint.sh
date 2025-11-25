#!/bin/sh
set -e

# Instala dependencias solo cuando faltan para evitar depender del host.
if [ ! -d /app/node_modules ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "node_modules no encontrado; instalando dependencias dentro del contenedor..."
  npm ci
fi

exec "$@"
