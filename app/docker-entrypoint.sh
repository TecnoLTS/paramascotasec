#!/bin/sh
set -e

lock_hash_file="/app/node_modules/.package-lock.hash"
current_hash="$(sha1sum /app/package-lock.json 2>/dev/null | awk '{print $1}')"
existing_hash=""
[ -f "$lock_hash_file" ] && existing_hash="$(cat "$lock_hash_file" 2>/dev/null)"

# Instala dependencias si faltan o si la versión del lock cambió o si falta el binario de Next.
if [ ! -d /app/node_modules ] \
  || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ] \
  || [ ! -x /app/node_modules/.bin/next ] \
  || [ "$current_hash" != "$existing_hash" ]; then
  echo "Sincronizando dependencias (npm ci)..."
  rm -rf /app/node_modules
  npm ci
  echo "$current_hash" > "$lock_hash_file"
fi

exec "$@"
