# 🐳 Docker — Visão geral dos exercícios

Este documento resume o que foi feito em cada exercício de Docker do bootcamp Orion, como rodar cada um e as observações registradas durante o desenvolvimento. Os detalhes completos de cada exercício estão no README da respectiva pasta.

## Índice

| Exercício | Tema | Serviços | README |
|---|---|---|---|
| 1 | Dockerfile + Compose: "Hello Container" | `app` | [exercicio-1](exercicio-1/README.md) |
| 2 | Compose com API + Banco de Dados | `api`, `db` | [exercicio-2](exercicio-2/README.md) |
| 3 | Boas práticas + múltiplos ambientes | `api`, `db` (dev e prod) | [exercicio-3](exercicio-3/README.md) |
| Extra | Aplicação completa com Docker Compose | `api`, `db`, `adminer` (dev e prod) | [exercicio-extra](exercicio-extra/README.md) |

## Stack utilizada

| Item | Escolha | Motivo |
|---|---|---|
| Linguagem da API | Node.js 20 + Express | Estrutura com `package.json` e `src/index.js`, como no exemplo do desafio extra |
| Imagem base | `node:20-alpine` | Leve (~139MB nas imagens finais) |
| Banco de dados | `postgres:16-alpine` | Healthcheck nativo com `pg_isready` |
| Interface do banco | `adminer:4.8.1` | Leve e compatível com PostgreSQL sem configuração extra |
| Live reload | `nodemon` (ex. 3) e `node --watch` (extra) | Reinicia a API ao editar o código montado |

## Pré-requisitos

- Docker 24+
- Docker Compose v2.24.4+ (`docker compose version`). O desafio extra usa a tag `!override`, disponível a partir dessa versão.
- Portas livres no host: `3000`, `3001`, `5432`, `8080` e `8081`. Nem todos os exercícios usam todas as portas.

Os exercícios usam portas em comum. Antes de subir um exercício, derrube o anterior com `docker compose down` dentro da pasta dele.

---

## 🧱 Exercício 1 — Dockerfile + Compose: "Hello Container"

### O que foi feito

- Aplicação Express que responde `Hello from Docker!` na porta 3000.
- `Dockerfile` com `node:20-alpine`, `WORKDIR`, cópia do `package*.json` antes do código (para aproveitar o cache de camadas), `npm ci --omit=dev`, usuário não-root (`node`) e `CMD`.
- `docker-compose.yml` com build da imagem, porta `3000:3000` e volume opcional de `./src`, montado como somente leitura.
- `.dockerignore` para manter `node_modules`, `.git` e `.env` fora do contexto de build.

### Como rodar

```bash
cd docker/exercicio-1
docker compose up -d --build
curl http://localhost:3000
# Hello from Docker!
docker compose down
```

### Observações

- O volume reflete as alterações em `./src` dentro do container, mas a aplicação não tem live reload. Para aplicar uma alteração, rode `docker compose restart`.
- Imagem final: ~138MB.

---

## 🗃️ Exercício 2 — Compose com API + Banco de Dados

### O que foi feito

- API Express com as rotas `GET /items` e `POST /items`, conectando ao Postgres pelo hostname do serviço (`db`) com as variáveis `DB_HOST`, `DB_USER`, `DB_PASS` e `DB_NAME`.
- Serviço `db` com `postgres:16-alpine` e volume nomeado `pgdata` para persistência.
- Variáveis sensíveis em um `.env` externo. O `.env.example` é versionado e o `.env` real fica no `.gitignore`.
- `depends_on` para o `db` iniciar antes da `api`.
- Função `waitForDatabase` em `src/db.js`: como o `depends_on` simples não espera o Postgres aceitar conexões, a API tenta se conectar até 10 vezes antes de subir.

### Como rodar

```bash
cd docker/exercicio-2
cp .env.example .env   # ajuste DB_PASS
docker compose up -d --build

curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "primeiro item"}'
curl http://localhost:3000/items

# Teste de persistência
docker compose down
docker compose up -d
curl http://localhost:3000/items   # o item continua lá

docker compose down      # mantém os dados
docker compose down -v   # apaga também o volume
```

### Observações

- Um `POST` sem o campo `name` retorna `400`.
- O Compose cria a rede `exercicio-2_default`, e a API resolve o banco pelo nome do serviço.

---

## ⚙️ Exercício 3 — Boas Práticas + Múltiplos Ambientes

### O que foi feito

- Mesma API do exercício 2, com o `nodemon` como dependência de dev.
- `Dockerfile` multi-stage com quatro estágios:

  | Estágio | Conteúdo |
  |---|---|
  | `base` | `node:20-alpine`, `WORKDIR` e `package*.json` |
  | `dev` | Todas as dependências e `npm run dev` (nodemon) |
  | `deps-prod` | Apenas dependências de produção (`npm ci --omit=dev`) |
  | `prod` | `node_modules` de produção + código, usuário não-root |

- `docker-compose.dev.yml`: `target: dev`, `./api/src` montado, live reload e Postgres exposto na porta 5432 para inspeção.
- `docker-compose.prod.yml`: `target: prod`, sem volumes de código e com `restart: unless-stopped`.
- Cada arquivo tem um `name:` próprio (`exercicio-3-dev` e `exercicio-3-prod`), então containers, rede e volume ficam separados.

### Como rodar

```bash
cd docker/exercicio-3
cp .env.example .env   # ajuste DB_PASS

# Desenvolvimento (http://localhost:3000)
docker compose -f docker-compose.dev.yml up --build

# Produção (http://localhost:3001)
docker compose -f docker-compose.prod.yml up -d --build

docker compose ls      # os dois ambientes podem rodar ao mesmo tempo

docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.prod.yml down
```

### Observações

- **Tamanho das imagens**: dev (~140MB) e prod (~139MB) ficam parecidas, porque a maior parte é a própria `node:20-alpine` e o `nodemon` é pequeno. O ganho do prod está no que fica de fora: dependências de dev e acesso de escrita ao código.
- **`--omit=dev`**: substitui o `--only=production` citado no enunciado, que está obsoleto no npm atual.
- **`npm audit`**: aponta 2 vulnerabilidades moderadas no `minimatch`, usado pelo `nodemon`. Afetam só a imagem de dev, e até a versão mais recente do `nodemon` (3.1.14) ainda depende da versão afetada.

---

## 🚀 Desafio Extra — Aplicação Completa com Docker Compose

### O que foi feito

- **API** com as rotas `GET /health`, `GET /items` e `POST /items`. A conexão com o banco fica em `src/db.js`, e as rotas em `src/index.js`.
  - `/health` retorna `200 {"status":"ok","database":"up"}`, ou `503 {"status":"error","database":"down"}` quando o banco está fora.
  - O `Dockerfile` tem um `HEALTHCHECK` que chama `/health`.
- **Banco** com `postgres:16-alpine`, volume nomeado `db-data` e healthcheck `pg_isready -h localhost`.
- **Adminer** já apontando para o servidor `db`.
- **Rede nomeada** `app-network` compartilhada pelos três serviços.
- `depends_on` com `condition: service_healthy`: a API e o Adminer só sobem quando o banco aceita conexões.
- **Dev e prod com o padrão de override do Compose:**
  - `docker-compose.yml` é a base, com a configuração de produção.
  - `docker-compose.override.yml` é a camada de desenvolvimento: código montado, `node --watch` e `NODE_ENV=development`. O Compose aplica esse arquivo automaticamente no `docker compose up`.

### Como rodar

```bash
cd docker/exercicio-extra
cp .env.example .env   # ajuste DB_PASS
```

| Ambiente | Comando | API | Adminer |
|---|---|---|---|
| dev | `docker compose up -d --build` | http://localhost:3000 | http://localhost:8080 |
| prod | `docker compose -f docker-compose.yml up -d --build` | http://localhost:3001 | http://localhost:8081 |

```bash
docker compose ps                  # api e db devem aparecer como (healthy)
curl http://localhost:3000/health
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "primeiro item"}'
curl http://localhost:3000/items
```

Login no Adminer: sistema **PostgreSQL**, servidor **`db`**, e usuário, senha e base com os valores de `DB_USER`, `DB_PASS` e `DB_NAME` do `.env`.

```bash
docker compose down                          # dev
docker compose -f docker-compose.yml down    # prod
# Acrescente -v para apagar também o volume do banco
```

### Observações

- **Por que override e não dois arquivos completos**: o enunciado mostra um único `docker-compose.yml` e avalia o `docker compose up -d`. Com o override, esse comando funciona como pedido e sobe o ambiente de dev. Além disso, os dois ambientes não repetem a definição do banco, do Adminer e dos healthchecks. A abordagem de dois arquivos completos já aparece no exercício 3.
- **Ambientes independentes**: cada modo tem seu próprio nome de projeto (`exercicio-extra-dev` e `exercicio-extra-prod`). O Compose usa esse nome como prefixo da rede e do volume, então dev e prod têm bancos separados e podem rodar ao mesmo tempo.
- **`!override` nas portas**: no override, as portas usam `!override` para substituir as da base em vez de somar a elas. Esse recurso exige o Compose 2.24.4 ou mais recente.
- **Sem `waitForDatabase`**: o `depends_on` com `service_healthy` já garante a ordem de inicialização, então a lógica de espera dos exercícios 2 e 3 não é necessária aqui.
- **`pg_isready -h localhost`**: na primeira inicialização, a imagem do Postgres sobe um servidor temporário que só aceita conexões locais. Sem o `-h localhost`, o banco poderia ser marcado como pronto antes de aceitar conexões TCP, que é como a API conecta.
- **Resiliência**: a API trata o evento `error` do pool do `pg`. Sem esse tratamento, a queda do banco derrubava o processo da API, e o `node --watch` não o reiniciava. Agora, com o banco fora, `/health` responde `503`, e quando o banco volta a API se reconecta sozinha.
- **`node --watch` em vez de `nodemon`**: o `--watch` já vem no Node 20. Assim, a mesma imagem serve aos dois modos, sem dependências de dev e sem os alertas do `npm audit` do exercício 3.
- **`.env` não versionado**: a estrutura de exemplo do enunciado mostra um `.env`, mas ele guarda credenciais. Por isso só o `.env.example` vai para o repositório.
- **Adminer em produção**: o Adminer sobe nos dois modos porque o enunciado exige ele na stack. Num projeto real, ele não ficaria exposto em produção.

---

## 🛠️ Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| Build termina, mas a API falha com `Cannot find module 'express'` | Os containers não conseguem resolver DNS, e o `npm ci` termina sem instalar os pacotes (o npm mostra `Exit handler never called!`) | Configure um DNS no daemon do Docker: `echo '{ "dns": ["1.1.1.1", "8.8.8.8"] }' \| sudo tee /etc/docker/daemon.json` e depois `sudo systemctl restart docker` |
| `Bind for 0.0.0.0:XXXX failed: port is already allocated` | Outro container ou serviço já usa a porta | Derrube o outro exercício ou ajuste as portas no `.env` (desafio extra) |
| `The container name "/..." is already in use` | Sobrou um container de uma execução anterior | `docker compose down` na pasta do exercício e suba de novo |
| API do exercício 2 ou 3 demora a responder após o `up` | O Postgres ainda está inicializando | A API tenta se conectar várias vezes; acompanhe com `docker compose logs -f api` |

O `echo ... | sudo tee` do primeiro item sobrescreve o `/etc/docker/daemon.json`. Se o arquivo já existir na sua máquina, adicione a chave `dns` a ele em vez de rodar o comando.

## 🔀 Fluxo de entrega

- **Gitflow**: cada exercício foi desenvolvido em uma branch `feature/docker-exercicio-*` a partir da `develop` e integrado por pull request. A entrega final segue para a `main` por uma branch `release/*`.
- **Conventional Commits**: `feat` (código da aplicação), `build` (Dockerfile e Compose), `chore` (arquivos de apoio, como `.dockerignore` e `.env.example`) e `docs` (READMEs).

| PR | Branch | Conteúdo |
|---|---|---|
| #1 | `feature/docker-exercicio-1` | Exercício 1 |
| #2 | `feature/docker-exercicio-2` | Exercício 2 |
| #3 | `feature/docker-exercicio-3` | Exercício 3 |
| #4 | `feature/docker-exercicio-extra` | Desafio extra |
