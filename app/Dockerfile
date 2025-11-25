FROM node:20-alpine

WORKDIR /app

# Instala dependencias exactas según lockfile
COPY package*.json ./
RUN npm ci

# Copia el código de la app
COPY . .

EXPOSE 3000

# Modo desarrollo para ver cambios en caliente
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
