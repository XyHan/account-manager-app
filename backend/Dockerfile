FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ── Développement (hot reload) ──────────────────────────────────────────────
FROM base AS dev
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
CMD ["pnpm", "start:dev"]

# ── Build de production ──────────────────────────────────────────────────────
FROM base AS build
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ── Production ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
USER node
CMD ["node", "dist/main"]
