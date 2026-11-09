# 🧱 Exercício 1 — Dockerfile + Compose: "Hello Container"

Aplicação Node.js (Express) que responde `Hello from Docker!`, empacotada em uma imagem customizada e orquestrada com Docker Compose.

## Estrutura

```
exercicio-1/
├── src/
│   └── server.js        # Aplicação Express
├── .dockerignore        # Arquivos fora do contexto de build
├── Dockerfile           # Imagem customizada (node:20-alpine)
├── docker-compose.yml   # Build, porta e volume
├── package.json
└── package-lock.json
```

## Como executar

```bash
docker compose up -d --build
curl http://localhost:3000
# Hello from Docker!
```

Para parar:

```bash
docker compose down
```

## Edição em tempo real (volume)

O diretório `./src` é montado em `/app/src` (somente leitura). Após editar o código, reinicie o container para aplicar:

```bash
docker compose restart
```

## Boas práticas aplicadas

- **Imagem base leve**: `node:20-alpine`.
- **Cache de camadas**: `package*.json` é copiado e as dependências instaladas antes do código-fonte.
- **Build reprodutível**: `npm ci` a partir do `package-lock.json`, sem dependências de desenvolvimento.
- **Usuário não-root**: o processo roda como `node`.
- **`.dockerignore`**: evita enviar `node_modules`, `.git`, `.env` etc. para o contexto de build.
