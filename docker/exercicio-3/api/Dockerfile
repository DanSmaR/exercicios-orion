# ---------- base: manifestos compartilhados ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev: todas as dependências + live reload ----------
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci && npm cache clean --force
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- deps-prod: só dependências de produção ----------
FROM base AS deps-prod
RUN npm ci --omit=dev && npm cache clean --force

# ---------- prod: imagem final enxuta ----------
FROM node:20-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps-prod --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
