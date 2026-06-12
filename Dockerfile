# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for darts_webpage (Next.js 15 production build)

# -------- 1. Dependencies stage --------
# Telepítjük a teljes deps csomagot (devDependencies is kell a buildhez)
FROM node:22-alpine AS deps
WORKDIR /app

# Prisma engine binary letöltéséhez szükséges (Alpine: libc6-compat)
RUN apk add --no-cache libc6-compat

# Copy only package files first a jobb layer cache-eléshez
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# postinstall: prisma generate (a Prisma clientet a node_modules-ba generálja)
RUN npm ci

# -------- 2. Build stage --------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# A deps stage-ből átmásoljuk a node_modules-t (már tartalmazza a prisma generate-et)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# A Next.js production build futtatása
# A build script: "prisma generate && next build" (a package.json-ban)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN mkdir -p /app/public
RUN npm run build

# -------- 3. Production runtime stage --------
# Minimális image: csak production deps + a buildelt app
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# A Next.js standalone buildet használjuk, ha elérhető;
# egyébként a .next + public mappákat másoljuk
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
