# ⚙️ Exercício 3 — Boas Práticas + Múltiplos Ambientes

A API do [exercício 2](../exercicio-2) (Node.js + PostgreSQL) com um Dockerfile multi-stage e um arquivo Compose para cada ambiente: **dev** e **prod**.

## Estrutura

```
exercicio-3/
├── api/
│   ├── src/
│   │   ├── db.js
│   │   └── index.js
│   ├── .dockerignore
│   ├── Dockerfile            # Estágios base, dev, deps-prod e prod
│   ├── package.json
│   └── package-lock.json
├── .env.example
├── docker-compose.dev.yml    # target dev, código montado, live reload
├── docker-compose.prod.yml   # target prod, sem volumes de código
└── README.md
```

## Dockerfile multi-stage

| Estágio | Base | Conteúdo |
|---|---|---|
| `base` | `node:20-alpine` | `WORKDIR` e `package*.json`, compartilhados pelos demais |
| `dev` | `base` | Todas as dependências (inclui `nodemon`) e `npm run dev` |
| `deps-prod` | `base` | Apenas dependências de produção (`npm ci --omit=dev`) |
| `prod` | `node:20-alpine` | Só `node_modules` de produção + código, usuário não-root, `node src/index.js` |

O `--omit=dev` substitui o `--only=production`, que está obsoleto no npm atual.

## Como executar

```bash
cp .env.example .env   # ajuste a senha em DB_PASS
```

### Desenvolvimento

```bash
docker compose -f docker-compose.dev.yml up --build
```

- API em http://localhost:3000
- `./api/src` montado em `/app/src`: o `nodemon` reinicia a API a cada alteração no código.
- Postgres exposto em `localhost:5432` para inspeção com um cliente local.

### Produção

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- API em http://localhost:3001
- Imagem final sem volumes de código, sem `nodemon` e rodando como o usuário `node`.
- Containers com `restart: unless-stopped`.

## Ambientes independentes

Cada arquivo define seu próprio `name:` (`exercicio-3-dev` e `exercicio-3-prod`), então cada ambiente tem containers, rede e volume (`pgdata`) separados. As portas também são diferentes (3000 e 3001), e os dois podem rodar ao mesmo tempo:

```bash
docker compose ls
# exercicio-3-dev    running(2)
# exercicio-3-prod   running(2)
```

## Observações

- **Tamanho das imagens**: dev e prod ficam com tamanhos parecidos (~140MB), porque a maior parte é a própria `node:20-alpine` e o `nodemon` é pequeno. O ganho do prod está no que fica de fora: dependências de dev, ferramentas de build e escrita no código.
- **`npm audit`**: aponta 2 vulnerabilidades moderadas no `minimatch`, usado pelo `nodemon`. Elas só existem na imagem de dev, já que o prod não instala dependências de dev. Ainda não há versão do `nodemon` com a correção.
