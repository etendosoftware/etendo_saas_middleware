# Etapa 1: Construcción de la aplicación
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json (o yarn.lock)
COPY etendo_saas_middleware/package*.json ./
# Si usas Yarn, usa:
# COPY yarn.lock ./

# Instala las dependencias
RUN npm install
# Si usas Yarn, usa:
# RUN yarn install

# Copia el resto del código de la aplicación
COPY etendo_saas_middleware/. .

# Construye la aplicación para producción
RUN npm run build
# Si usas Yarn, usa:
# RUN yarn build

# Etapa 2: Producción
FROM node:18-alpine

RUN apk add --no-cache python3 make g++
# Establece el directorio de trabajo
WORKDIR /app

# Copia solo las dependencias de producción desde la etapa de construcción
COPY etendo_saas_middleware/package*.json ./
# Si usas Yarn, usa:
# COPY yarn.lock ./

RUN npm install --production
# Si usas Yarn, usa:
# RUN yarn install --production

# Copia los archivos de construcción desde la etapa anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./

# Exponer el puerto que utilizará la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
# Si usas Yarn, usa:
# CMD ["yarn", "start"]