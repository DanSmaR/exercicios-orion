# 🗃️ Exercício 2 — Compose com API + Banco de Dados

Stack com dois serviços: uma API Node.js (Express) e um banco PostgreSQL. Eles se comunicam pela rede interna criada pelo Docker Compose.

## Estrutura

```
exercicio-2/
├── api/
│   ├── src/
│   │   ├── db.js          # Conexão com o Postgres, retry e criação da tabela
│   │   └── index.js       # Rotas da API
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── .env.example           # Modelo das variáveis sensíveis
├── docker-compose.yml
└── README.md
```

## Serviços

| Serviço | Imagem | Descrição |
|---|---|---|
| `api` | build de `./api` (`node:20-alpine`) | Conecta ao banco pelo hostname `db` usando `DB_HOST`, `DB_USER`, `DB_PASS` e `DB_NAME` |
| `db` | `postgres:16-alpine` | Dados persistidos no volume nomeado `pgdata` |

## Como executar

```bash
cp .env.example .env   # ajuste a senha em DB_PASS
docker compose up -d --build
```

### Gravar e listar dados

```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "primeiro item"}'

curl http://localhost:3000/items
```

### Testar a persistência

```bash
docker compose down      # remove containers e rede, mantém o volume
docker compose up -d
curl http://localhost:3000/items   # o item continua lá
```

Para apagar os dados também: `docker compose down -v`.

## Detalhes

- **Rede interna**: o Compose cria a rede `exercicio-2_default`, e a API resolve o banco pelo nome do serviço (`db`).
- **Variáveis sensíveis**: ficam no `.env`, que está no `.gitignore`. O Compose lê esse arquivo automaticamente e repassa os valores para os dois serviços.
- **`depends_on`**: garante que o `db` seja iniciado antes da `api`. Ele não espera o Postgres aceitar conexões, então a API tenta se conectar várias vezes antes de subir (`waitForDatabase` em `src/db.js`).
