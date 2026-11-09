FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copia apenas os manifestos primeiro para aproveitar o cache de camadas
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src

USER node

EXPOSE 3000

# O wget já vem no alpine (busybox), sem instalar nada extra
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
