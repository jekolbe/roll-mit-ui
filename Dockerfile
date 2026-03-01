# Production Dockerfile for Angular 21 SSR app
#
# Build:  docker build -t roll-mit-ui .
# Run:    docker run -p 4000:4000 roll-mit-ui
# Custom port: docker run -p 8080:8080 -e PORT=8080 roll-mit-ui
#
# =============================================================================
# Stage 1: Build the Angular app (browser + server bundles)
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (use same node/npm as runtime for ABI compatibility)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Production build (outputs to dist/app: browser/ and server/)
RUN npm run build

# =============================================================================
# Stage 2: Production runtime
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001 -G nodejs

# Copy dependency manifests and install production-only dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=angular:nodejs /app/dist/app ./dist/app

USER angular

# Server reads PORT from env (default 4000)
ENV NODE_ENV=production
EXPOSE 4000

# Health check (optional; adjust path if your app has a health endpoint)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD wget -q -O - http://localhost:4000/ || exit 1

CMD ["node", "dist/app/server/server.mjs"]
