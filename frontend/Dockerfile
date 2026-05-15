FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ── Développement (hot reload) ──────────────────────────────────────────────
FROM base AS dev
RUN npm install -g @angular/cli
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]

# ── Build de production ──────────────────────────────────────────────────────
FROM base AS build
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ── Production (nginx) ───────────────────────────────────────────────────────
FROM nginx:alpine AS prod
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
