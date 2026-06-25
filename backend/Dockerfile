# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY tsconfig.json ./

# Install development dependencies
RUN npm ci

# Copy Prisma schema and application source code
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma Client and compile TypeScript
RUN npm run prisma:generate
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package configurations
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy compiled resources and generated Prisma schemas
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose server port
EXPOSE 5000

# Start Express & WebSocket application
CMD ["node", "dist/server.js"]
