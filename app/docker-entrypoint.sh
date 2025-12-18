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
  || [ ! -d /app/node_modules/@prisma/client ] \
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

# Asegura Prisma aunque no se cumpla el bloque anterior
if [ ! -d /app/node_modules/@prisma/client ]; then
  echo "Instalando @prisma/client y prisma..."
  npm install --no-save @prisma/client prisma
fi

# Genera cliente Prisma si no existe
if [ ! -d /app/node_modules/.prisma/client ]; then
  echo "Generando cliente Prisma..."
  npx prisma generate || true
fi

# Sincroniza base de datos con reintentos
if [ -n "$DATABASE_URL" ]; then
  echo "Sincronizando base de datos con prisma db push..."
  for i in 1 2 3 4 5; do
    if npx prisma db push; then
      break
    fi
    echo "Reintento prisma db push ($i/5)..."
    sleep 3
  done

  echo "Ejecutando seed de datos..."
  npm run db:seed || true

else
  echo "DATABASE_URL no definido; omitiendo prisma db push/seed."
fi

exec "$@"
