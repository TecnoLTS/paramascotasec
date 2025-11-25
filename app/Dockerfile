FROM node:20-alpine

WORKDIR /app

# Instala dependencias exactas según lockfile
COPY package*.json ./
RUN npm ci

# Copia el código de la app
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
