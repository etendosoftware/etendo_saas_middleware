# Etapa 1: Construcción (Build)
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias (incluyendo dev) para la compilación
RUN npm ci

# Copiamos el resto del código
COPY . .

# Generar el build standalone
RUN npm run build

# Etapa 2: Runtime (Ejecución)
FROM node:18-alpine AS runner

WORKDIR /app

# Copiamos el resultado del build standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./static

# Puerto por defecto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]