#!/bin/sh
set -e

lock_hash_file="/app/node_modules/.package-lock.hash"
current_hash="$(sha1sum /app/package-lock.json 2>/dev/null | awk '{print $1}' || true)"
existing_hash="$(cat "$lock_hash_file" 2>/dev/null || true)"

# Instala dependencias solo si faltan o cambió el lockfile
if [ ! -d /app/node_modules ] \
  || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ] \
  || [ "$current_hash" != "$existing_hash" ]; then
  echo "Sincronizando dependencias (npm ci)..."
  rm -rf /app/node_modules 2>/dev/null || true
  npm ci --no-audit --progress=false
  echo "$current_hash" > "$lock_hash_file"
fi

exec "$@"
