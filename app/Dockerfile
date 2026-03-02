FROM node:20-alpine

WORKDIR /app

# Control de ambiente (development | production)
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=${APP_ENV}

# Instala dependencias según ambiente (prod sin dev deps)
COPY package*.json ./
RUN if [ "$APP_ENV" = "production" ]; then npm ci --omit=dev --legacy-peer-deps; else NODE_ENV=development npm install --include=dev --legacy-peer-deps; fi \
    && mkdir -p /app/node_modules \
    && sha1sum /app/package-lock.json | awk '{print $1}' > /app/node_modules/.package-lock.hash

# Copia el código de la app
COPY . .

# Build de producción de Next (omitido en dev para que el contenedor arranque más rápido)
RUN if [ "$APP_ENV" = "production" ]; then npm run build; else echo "Skip build in development"; fi

# Copia el entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "if [ \"$APP_ENV\" = \"development\" ]; then npm run dev -- --hostname 0.0.0.0 --port 3000; else npm run start -- --hostname 0.0.0.0 --port 3000; fi"]
