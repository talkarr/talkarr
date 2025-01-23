FROM node:23-alpine AS base

# Install dependencies
FROM base AS deps

# https://github.com/nodejs/docker-node/issues/1335#issuecomment-1743914810
RUN yarn config set network-timeout 500000 -g

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat ffmpeg python3 py3-pip
RUN yarn global add node-gyp

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock .npmrc* ./
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma.io
RUN yarn prisma generate

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# create logs folder for the app
RUN mkdir -p /app/logs

# make sure the user has the right permissions
RUN chown -R nextjs:nodejs /app/logs

USER nextjs

# use these for non-standalone output
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/backend ./backend

COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/constants.ts ./src/constants.ts

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# use these for standalone output
# COPY --from=builder /app/.next/standalone/.next ./.next
# COPY --from=builder /app/.next/standalone/package.json ./package.json
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/node_modules ./node_modules

# backend.json openapi file
COPY --from=builder --chown=nextjs:nodejs /app/backend.json ./backend.json

EXPOSE 3232

ENV PORT=3232

ENV HOSTNAME="0.0.0.0"
# CMD yarn start:prod
SHELL ["/bin/bash", "-c"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 CMD curl --fail http://localhost:3232/healthz || exit 1

CMD ["yarn", "start:prod"]
