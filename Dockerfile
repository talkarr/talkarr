FROM node:23-alpine AS base

# Install dependencies
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat ffmpeg python3 py3-pip
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

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/backend ./backend

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

EXPOSE 3232

ENV PORT=3232

ENV HOSTNAME="0.0.0.0"
CMD ["yarn", "start:prod"]
