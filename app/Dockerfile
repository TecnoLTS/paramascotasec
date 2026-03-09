# syntax=docker/dockerfile:1.7
FROM node:22-alpine

WORKDIR /app

# Control de ambiente (development | production)
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=development

# Instala dependencias para build de producción.
# En desarrollo se omite aquí porque /app y /app/node_modules se montan por volumen
# y el entrypoint sincroniza dependencias solo cuando hace falta.
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    if [ "$APP_ENV" = "production" ]; then NODE_ENV=development npm ci --legacy-peer-deps; else echo "Skip dependency install in development image"; fi \
    && mkdir -p /app/node_modules \
    && sha1sum /app/package-lock.json | awk '{print $1}' > /app/node_modules/.package-lock.hash

# Copia el código de la app
COPY . .

# Build de producción de Next (omitido en dev para que el contenedor arranque más rápido).
# Luego se eliminan devDependencies para reducir imagen final de runtime.
RUN --mount=type=cache,target=/app/.next/cache \
    if [ "$APP_ENV" = "production" ]; then NODE_ENV=production npm run build && npm prune --omit=dev; else echo "Skip build in development"; fi

# Copia el entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "if [ \"$APP_ENV\" = \"development\" ]; then npm run dev -- --hostname 0.0.0.0 --port 3000; else npm run start -- --hostname 0.0.0.0 --port 3000; fi"]
