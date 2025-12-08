FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Instala dependencias (permite actualizar lock en la imagen si hay cambios)
COPY package*.json ./
RUN npm install
# Asegura prisma en la imagen aunque el lock local no esté actualizado
RUN npm install --no-save prisma @prisma/client

# Copia el código de la app
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
