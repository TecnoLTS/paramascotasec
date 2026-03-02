#!/bin/sh
set -e

lock_hash_file="/app/node_modules/.package-lock.hash"
# Evita que falle si el hash previo o el lock no existen aún.
current_hash="$(sha1sum /app/package-lock.json 2>/dev/null | awk '{print $1}' || true)"
existing_hash="$(cat "$lock_hash_file" 2>/dev/null || true)"

# En producción, las dependencias deben venir preempaquetadas en la imagen.
if [ "$APP_ENV" = "production" ]; then
  if [ ! -x /app/node_modules/.bin/next ]; then
    echo "Faltan dependencias de producción dentro de la imagen (/app/node_modules/.bin/next)."
    exit 1
  fi
else
  # En desarrollo sí sincronizamos dependencias cuando cambia el lock o falta node_modules.
  if [ ! -d /app/node_modules ] \
    || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ] \
    || [ ! -x /app/node_modules/.bin/next ] \
    || [ "$current_hash" != "$existing_hash" ]; then
  echo "Sincronizando dependencias (npm ci)..."
  mkdir -p /app/node_modules
  # Si el volumen impide borrar el directorio, limpiamos su contenido.
  rm -rf /app/node_modules/* /app/node_modules/.[!.]* /app/node_modules/..?* 2>/dev/null || true
  if ! npm ci; then
    echo "npm ci falló; intentando npm install para alinear package-lock.json..."
    rm -rf /app/node_modules/* /app/node_modules/.[!.]* /app/node_modules/..?* 2>/dev/null || true
    npm install
  fi
  echo "$current_hash" > "$lock_hash_file"
  fi
fi

# Build en caliente si estamos en producción y falta el build
if [ "$APP_ENV" = "production" ] && [ ! -f /app/.next/BUILD_ID ]; then
  echo "Construyendo Next para producción..."
  npm run build
fi

exec "$@"
