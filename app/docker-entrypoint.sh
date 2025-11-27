#!/bin/sh
set -e

lock_hash_file="/app/node_modules/.package-lock.hash"
# Evita que falle si el hash previo o el lock no existen aún.
current_hash="$(sha1sum /app/package-lock.json 2>/dev/null | awk '{print $1}' || true)"
existing_hash="$(cat "$lock_hash_file" 2>/dev/null || true)"

# Instala dependencias si faltan o si la versión del lock cambió o si falta el binario de Next.
if [ ! -d /app/node_modules ] \
  || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ] \
  || [ ! -x /app/node_modules/.bin/next ] \
  || [ "$current_hash" != "$existing_hash" ]; then
  echo "Sincronizando dependencias (npm ci)..."
  mkdir -p /app/node_modules
  # Si el volumen impide borrar el directorio, limpiamos su contenido.
  rm -rf /app/node_modules/* /app/node_modules/.[!.]* /app/node_modules/..?* 2>/dev/null || true
  npm ci || {
    echo "npm ci falló; reintentando tras limpiar node_modules..."
    rm -rf /app/node_modules/* /app/node_modules/.[!.]* /app/node_modules/..?* 2>/dev/null || true
    npm ci
  }
  echo "$current_hash" > "$lock_hash_file"
fi

exec "$@"
