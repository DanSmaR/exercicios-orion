# 🚀 Desafio Extra — Aplicação Completa com Docker Compose

Stack com três serviços: uma API Node.js (Express), um banco PostgreSQL e o Adminer como interface web de administração do banco.

## Estrutura

```
exercicio-extra/
├── api/
│   ├── src/
│   │   ├── db.js          # Conexão com o Postgres e criação da tabela
│   │   └── index.js       # Rotas da API
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── .env.example                 # Modelo do .env (o .env real não é versionado)
├── docker-compose.yml           # Base da stack (configuração de produção)
├── docker-compose.override.yml  # Camada de desenvolvimento
└── README.md
```

## Serviços

| Serviço | Imagem | Porta dev | Porta prod | Descrição |
|---|---|---|---|---|
| `api` | build de `./api` (`node:20-alpine`) | `3000` | `3001` | API com `/health` e CRUD de `items`; conecta ao banco pelo hostname `db` |
| `db` | `postgres:16-alpine` | interna | interna | Volume nomeado `db-data` e healthcheck com `pg_isready` |
| `adminer` | `adminer:4.8.1` | `8080` | `8081` | Interface web do banco, já apontando para o servidor `db` |

Os três serviços estão na rede nomeada `app-network`. As portas podem ser alteradas no `.env`.

## Como executar

```bash
cp .env.example .env   # ajuste a senha em DB_PASS
```

### Desenvolvimento

```bash
docker compose up -d --build
docker compose ps      # api e db devem aparecer como (healthy)
```

O Compose lê automaticamente o `docker-compose.override.yml` junto com o `docker-compose.yml`. Nesse modo:

- `./api/src` é montado em `/app/src`;
- a API roda com `node --watch`, que a reinicia a cada alteração no código;
- `NODE_ENV=development`.

### Produção

```bash
docker compose -f docker-compose.yml up -d --build
```

Ao passar só o `docker-compose.yml`, o override fica de fora. A API roda direto da imagem com `node src/index.js` e `NODE_ENV=production`, sem volume de código.

Os dois modos usam a mesma imagem: o `node --watch` já vem no Node 20, então o dev não precisa de dependências extras.

### Ambientes independentes

Cada modo tem seu próprio nome de projeto (`exercicio-extra-dev` e `exercicio-extra-prod`). O Compose usa esse nome como prefixo da rede e do volume, então cada ambiente tem seu próprio banco:

| Ambiente | Rede | Volume do banco |
|---|---|---|
| dev | `exercicio-extra-dev_app-network` | `exercicio-extra-dev_db-data` |
| prod | `exercicio-extra-prod_app-network` | `exercicio-extra-prod_db-data` |

Como as portas também são diferentes, os dois podem rodar ao mesmo tempo:

```bash
docker compose ls
# exercicio-extra-dev    running(3)
# exercicio-extra-prod   running(3)
```

No override, as portas usam `!override` para substituir as da base em vez de somar a elas. Esse recurso exige o Docker Compose 2.24.4 ou mais recente.

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | `200 {"status":"ok","database":"up"}` ou `503` se o banco estiver fora |
| `GET` | `/items` | Lista os itens |
| `POST` | `/items` | Cria um item: `{"name": "..."}` |

```bash
# dev na porta 3000; em prod, use 3001
curl http://localhost:3000/health

curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "primeiro item"}'

curl http://localhost:3000/items
```

## Adminer

Acesse http://localhost:8080 (dev) ou http://localhost:8081 (prod) e entre com:

| Campo | Valor |
|---|---|
| Sistema | PostgreSQL |
| Servidor | `db` (já preenchido) |
| Usuário | valor de `DB_USER` no `.env` |
| Senha | valor de `DB_PASS` no `.env` |
| Base de dados | valor de `DB_NAME` no `.env` |

A tabela `items` aparece no schema `public`.

## Detalhes

- **Ordem de inicialização**: o `db` tem healthcheck com `pg_isready -h localhost`. A `api` e o `adminer` usam `depends_on` com `condition: service_healthy`, então só sobem quando o banco já aceita conexões. Por isso a API não precisa de lógica própria de espera, como a `waitForDatabase` dos exercícios 2 e 3. O `-h localhost` faz o teste por TCP, como a API conecta. Sem ele, o banco poderia ser marcado como pronto durante o servidor temporário da primeira inicialização, que só aceita conexões locais.
- **Healthcheck da API**: o Dockerfile define um `HEALTHCHECK` que chama `/health` com o `wget` do alpine.
- **Variáveis de ambiente**: credenciais e portas ficam no `.env`, que está no `.gitignore`. O `.env.example` documenta as variáveis necessárias.
- **Imagem**: `node:20-alpine`, cache de camadas, `npm ci --omit=dev` e usuário não-root (~139MB).
- **Resiliência**: se o banco cair, a API continua de pé e `/health` passa a responder `503`. Quando o banco volta, a API se reconecta sozinha.

## Parar e limpar

```bash
docker compose down      # dev: mantém os dados no volume
docker compose down -v   # dev: remove também o volume

docker compose -f docker-compose.yml down      # prod
docker compose -f docker-compose.yml down -v   # prod, removendo o volume
```
