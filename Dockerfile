FROM node:24-alpine AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat ffmpeg yt-dlp pkg-config

# Install dependencies
FROM base AS deps

# https://github.com/nodejs/docker-node/issues/1335#issuecomment-1743914810
RUN yarn config set network-timeout 500000 -g && \
    yarn global add node-gyp

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock .npmrc* ./
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn YOUTUBE_DL_SKIP_DOWNLOAD=true yarn --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ENV IS_INSIDE_DOCKER=true

ARG OVERRIDE_CURRENT_COMMIT
ENV OVERRIDE_CURRENT_COMMIT=$OVERRIDE_CURRENT_COMMIT

ARG OVERRIDE_CURRENT_COMMIT_TS
ENV OVERRIDE_CURRENT_COMMIT_TS=$OVERRIDE_CURRENT_COMMIT_TS

ARG OVERRIDE_CURRENT_BRANCH
ENV OVERRIDE_CURRENT_BRANCH=$OVERRIDE_CURRENT_BRANCH

ARG OVERRIDE_CURRENT_TAG
ENV OVERRIDE_CURRENT_TAG=$OVERRIDE_CURRENT_TAG

ARG OVERRIDE_CURRENT_VERSION
ENV OVERRIDE_CURRENT_VERSION=$OVERRIDE_CURRENT_VERSION

ENV YTDLP_PATH_OVERRIDE=/usr/bin/yt-dlp

RUN yarn prisma generate && \
    yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# create logs folder for the app
# and make sure the user has the right permissions
RUN mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app/logs

# https://github.com/vercel/next.js/discussions/36935#discussioncomment-2757861
RUN mkdir -p /app/.next/cache/images && \
    chown -R nextjs:nodejs /app/.next/cache/images

VOLUME ["/app/.next/cache/images"]

USER nextjs

# node_modules first
COPY --chown=nextjs:nodejs ./package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# copy the generated files from node_modules from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# use these for non-standalone output
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

COPY --chown=nextjs:nodejs ./next.config.ts ./next.config.ts
COPY --chown=nextjs:nodejs ./src/constants.ts ./src/constants.ts

# backend.json openapi file
COPY --from=builder --chown=nextjs:nodejs /app/backend.json ./backend.json

# assets for backend
COPY --from=builder /app/assets ./assets

COPY --from=builder /app/backend ./backend
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

EXPOSE 3232

ENV IS_INSIDE_DOCKER=true

ARG OVERRIDE_CURRENT_COMMIT
ENV OVERRIDE_CURRENT_COMMIT=$OVERRIDE_CURRENT_COMMIT

ARG OVERRIDE_CURRENT_COMMIT_TS
ENV OVERRIDE_CURRENT_COMMIT_TS=$OVERRIDE_CURRENT_COMMIT_TS

ARG OVERRIDE_CURRENT_BRANCH
ENV OVERRIDE_CURRENT_BRANCH=$OVERRIDE_CURRENT_BRANCH

ARG OVERRIDE_CURRENT_TAG
ENV OVERRIDE_CURRENT_TAG=$OVERRIDE_CURRENT_TAG

ARG OVERRIDE_CURRENT_VERSION
ENV OVERRIDE_CURRENT_VERSION=$OVERRIDE_CURRENT_VERSION

ENV YTDLP_PATH_OVERRIDE=/usr/bin/yt-dlp

ENV PORT=3232

ENV HOSTNAME="0.0.0.0"
# CMD yarn start:prod
SHELL ["/bin/bash", "-c"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 CMD curl --fail http://localhost:3232/api/healthz || exit 1

CMD ["yarn", "start:prod"]
