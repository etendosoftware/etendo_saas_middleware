# Stage 1: Build the application
FROM node:18-alpine AS builder

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY etendo_saas_middleware/package*.json ./
# If using Yarn, use:
# COPY yarn.lock ./

# Install dependencies
RUN npm install
# If using Yarn, use:
# RUN yarn install

# Copy the rest of the application code
COPY etendo_saas_middleware/. .

# Build the application for production
RUN npm run build
# If using Yarn, use:
# RUN yarn build

# Stage 2: Production
FROM node:18-alpine

# Install necessary runtime tools
RUN apk add --no-cache python3 make g++

# Set the working directory
WORKDIR /app

# Copy only production dependencies from the build stage
COPY etendo_saas_middleware/package*.json ./
# If using Yarn, use:
# COPY yarn.lock ./

RUN npm install --production
# If using Yarn, use:
# RUN yarn install --production

# Copy build artifacts from the build stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public/assets ./public/assets
COPY --from=builder /app/next.config.js ./

# Expose the port the application will use
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
