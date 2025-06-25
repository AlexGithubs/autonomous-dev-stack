# Multi-stage build for production
FROM node:24-alpine AS deps
# Check kill switch
ARG HALT_PIPELINE=false
RUN if [ "$HALT_PIPELINE" = "true" ]; then echo "Pipeline halted" && exit 1; fi

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Development stage
FROM node:24-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Builder stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dev /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]