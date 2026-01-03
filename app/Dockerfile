FROM node:20-alpine

WORKDIR /app

# Dependencia necesaria para Prisma en alpine
RUN apk add --no-cache openssl

# Control de ambiente (development | production)
ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=${APP_ENV}

# Instala dependencias de npm (incluye dev deps aunque APP_ENV=production)
COPY package*.json ./
RUN NODE_ENV=development npm install --include=dev

# Copia el código de la app (incluye la carpeta prisma/)
COPY . .

# 🔹 Muy importante: generar el cliente de Prisma
RUN npx prisma generate

# Build de producción de Next (omitido en dev para que el contenedor arranque más rápido)
RUN if [ "$APP_ENV" = "production" ]; then npm run build; else echo "Skip build in development"; fi

# Copia el entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "if [ \"$APP_ENV\" = \"development\" ]; then npm run dev -- --hostname 0.0.0.0 --port 3000; else npm run start -- --hostname 0.0.0.0 --port 3000; fi"]
