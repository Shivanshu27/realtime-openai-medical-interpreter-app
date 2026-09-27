# ==============================================================================
# Multi-Stage Production Dockerfile for Real-Time Medical Interpreter
# Stage 1: Build the React Client SPA
# Stage 2: Install Production Server Dependencies
# Stage 3: Lean, Non-Root Runtime Container with Built-in Healthcheck
# ==============================================================================

# --- Stage 1: Build Client ---
FROM node:20-alpine AS client-builder
WORKDIR /build/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
ENV CI=false
RUN npm run build

# --- Stage 2: Build Server ---
FROM node:20-alpine AS server-builder
WORKDIR /build/server

COPY server/package*.json ./
RUN npm install --omit=dev

# --- Stage 3: Production Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl/wget for healthchecks
RUN apk add --no-cache curl

# Copy server production artifacts
COPY --from=server-builder --chown=node:node /build/server/node_modules ./server/node_modules
COPY --chown=node:node server/package*.json ./server/
COPY --chown=node:node server/index.js ./server/
COPY --chown=node:node server/src ./server/src

# Copy client production build
COPY --from=client-builder --chown=node:node /build/client/build ./client/build

# Use non-root node user for container security
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "server/index.js"]
