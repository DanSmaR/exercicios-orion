FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copia apenas os manifestos primeiro para aproveitar o cache de camadas
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
