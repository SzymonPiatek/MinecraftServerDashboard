# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
# Toolchain for compiling better-sqlite3 when no prebuilt binary matches; OpenSSL is needed by Prisma.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable
WORKDIR /repo

# Manifests first so the dependency layer is cached until they change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
# `postinstall` runs `prisma generate`, which needs the schema and config.
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@mcd/api..."

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter "@mcd/api..." build \
    && pnpm --filter @mcd/api deploy --legacy --prod /out

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=4000 DATABASE_URL=file:/data/dashboard.db
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /out ./
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/index.js"]
