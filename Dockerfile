FROM node:22.23.3-bookworm-slim AS widget
RUN npm install --global npm@12.2.0
WORKDIR /build
COPY archava/package.json archava/package-lock.json ./archava/
RUN npm ci --prefix archava
COPY package.json ./
COPY data ./data
COPY scripts/sync-archava-catalog.mjs ./scripts/
COPY archava/tsconfig.json archava/vite.config.ts archava/index.html ./archava/
COPY archava/config ./archava/config
COPY archava/server/config.mjs ./archava/server/
COPY archava/scripts/check-config.mjs ./archava/scripts/
COPY archava/src ./archava/src
COPY archava/public ./archava/public
RUN npm run build && npm prune --prefix archava --omit=dev

FROM python:3.12-slim-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libopus0 ffmpeg libstdc++6 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=widget /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY archava/backend/requirements.txt archava/backend/constraints.txt ./archava/backend/
RUN pip install --no-cache-dir -r archava/backend/requirements.txt
COPY --from=widget /build/archava/node_modules ./archava/node_modules
COPY --from=widget /build/archava/dist ./archava/dist
COPY --from=widget /build/archava/config ./archava/config
COPY package.json server.mjs pages.mjs compare-page.mjs index.html app.js ui.js styles.css ./
COPY data ./data
COPY templates ./templates
COPY assets ./assets
COPY scripts/start-cloud.mjs ./scripts/
COPY archava/package.json ./archava/
COPY archava/server ./archava/server
COPY archava/prompts ./archava/prompts
COPY archava/backend ./archava/backend
RUN useradd --create-home dopamine && chown -R dopamine:dopamine /app
USER dopamine
ENV PORT=8080 HOST=0.0.0.0 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
EXPOSE 8080
CMD ["node", "scripts/start-cloud.mjs"]
