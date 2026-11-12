# 🗄️ Banco de Dados — Visão geral dos exercícios

Este documento resume o que foi feito em cada exercício de banco de dados do bootcamp Orion, como rodar cada um e as observações registradas durante o desenvolvimento. Os prints dos resultados de cada exercício estão no README da respectiva pasta.

## Índice

| Exercício | Tema | Banco | Script | README |
|---|---|---|---|---|
| 1 | Relacional: SQL básico (`CREATE TABLE`, `INSERT`, `SELECT`) | PostgreSQL | [`exercicio-1.sql`](exercicio-1/exercicio-1.sql) | [exercicio-1](exercicio-1/README.md) |
| 2 | Relacional: `JOIN`s e filtros | PostgreSQL | [`exercicio-2.sql`](exercicio-2/exercicio-2.sql) | [exercicio-2](exercicio-2/README.md) |
| 3 | Não relacional: CRUD básico e schema flexível | MongoDB | [`exercicio-3.js`](exercicio-3/exercicio-3.js) | [exercicio-3](exercicio-3/README.md) |
| 4 | Não relacional: consultas avançadas | MongoDB | [`exercicio-4.js`](exercicio-4/exercicio-4.js) | [exercicio-4](exercicio-4/README.md) |

## Ambiente

Os dois bancos sobem juntos pelo [`docker-compose.yml`](docker-compose.yml) desta pasta:

| Serviço | Imagem | Container | Porta | Usado nos exercícios |
|---|---|---|---|---|
| `db_postgres` | `postgres:16-alpine` | `orion_postgres_db` | `5432` | 1 e 2 |
| `db_mongo` | `mongo:latest` | `orion_mongo_db` | `27017` | 3 e 4 |

Os dados ficam em volumes nomeados (`postgres_data` e `mongo_data`), então continuam lá depois de um `docker compose down`.

```bash
cd banco-de-dados
docker compose up -d     # sobe os dois bancos
docker compose ps        # os dois devem aparecer como (healthy)
docker compose down      # para os bancos (mantém os dados)
docker compose down -v   # para os bancos e apaga os volumes
```

### Dados de conexão

| Banco | Ferramenta | Conexão |
|---|---|---|
| PostgreSQL | DBeaver | Host `localhost`, porta `5432`, banco `orion_db`, usuário `orion_user`, senha `orion_password` |
| MongoDB | MongoDB Compass | `mongodb://orion_admin:orion_admin_pass@localhost:27017/` |

As credenciais são as do material de apoio do bootcamp e servem só para o ambiente local.

---

## 🧱 Exercício 1 — Relacional (SQL Básico)

### O que foi feito

- Tabela `cursos` com `id` (chave primária gerada automaticamente com `GENERATED ALWAYS AS IDENTITY`) e `nome_curso`.
- Tabela `alunos` com `id` (chave primária), `nome`, `email` (`UNIQUE`) e `curso_id`, que é chave estrangeira para `cursos(id)` com a constraint `fk_alunos_cursos`.
- 3 cursos inseridos (Desenvolvimento Web, Ciência de Dados e DevOps) e 4 alunos, distribuídos entre os dois primeiros cursos.

### Como rodar

No DBeaver, abra o `exercicio-1.sql` e execute como script (`Alt+X`). Pelo terminal:

```bash
cd banco-de-dados
docker exec -i orion_postgres_db psql -U orion_user -d orion_db < exercicio-1/exercicio-1.sql
```

### Observações

- O script começa com `DROP TABLE IF EXISTS`, então pode ser executado várias vezes e sempre recria as tabelas do zero. A tabela `alunos` é removida primeiro porque depende de `cursos`.
- O teste da chave estrangeira (inserir um aluno com `curso_id = 99`) está comentado no final do arquivo para não interromper o script. Executado sozinho, o Postgres recusa com `violates foreign key constraint "fk_alunos_cursos"`.
- O curso DevOps ficou sem alunos de propósito, para ser usado no extra do exercício 2.

---

## 🔗 Exercício 2 — Relacional (JOINs e Filtros)

### O que foi feito

- `INNER JOIN` entre `alunos` e `cursos` mostrando o nome do aluno e o nome do curso.
- `INNER JOIN` com `WHERE` listando só os alunos de Desenvolvimento Web.
- `UPDATE` movendo a Maria Souza para Ciência de Dados, seguido de um novo `SELECT` com `JOIN` que mostra a mudança.
- **Extra**: `LEFT JOIN` com `WHERE a.id IS NULL` para encontrar os cursos sem nenhum aluno (resultado: DevOps).

### Como rodar

```bash
cd banco-de-dados
docker exec -i orion_postgres_db psql -U orion_user -d orion_db < exercicio-2/exercicio-2.sql
```

### Observações

- Depende das tabelas e dos dados do exercício 1.
- O `UPDATE` busca o `curso_id` novo por uma subconsulta pelo nome do curso, sem depender do número do id, e encontra a Maria pelo `email`, que é único.
- Depois da primeira execução a Maria já está em Ciência de Dados, então a consulta com `WHERE` passa a retornar só o João. Para voltar ao estado inicial, rode o `exercicio-1.sql` de novo.

---

## 📄 Exercício 3 — Não relacional (CRUD Básico)

### O que foi feito

- Banco `orion_blog` com a coleção `posts`, criada com `db.createCollection("posts")`.
- Um post com `titulo`, `autor` e `conteudo`.
- Um segundo post com os mesmos campos e mais `tags: ["nosql", "flexivel"]`, inserido sem nenhuma alteração na coleção. Isso mostra o schema flexível: no SQL, um campo novo exigiria um `ALTER TABLE`.
- `find()` listando os dois documentos.

### Como rodar

No MongoDB Compass, abra o shell **MONGOSH** e cole o conteúdo do `exercicio-3.js`. Pelo terminal:

```bash
cd banco-de-dados
docker exec orion_mongo_db mongosh -u orion_admin -p orion_admin_pass \
  --quiet --eval "$(cat exercicio-3/exercicio-3.js)"
```

### Observações

- O script remove a coleção `posts` antes de recriá-la, então pode ser executado várias vezes sem duplicar documentos.
- O banco `orion_blog` é separado dos bancos de sistema do Mongo (`admin`, `config` e `local`).
- Passar o script pela entrada padrão (`mongosh < arquivo.js`) também funciona, mas a saída fica cheia de prompts. Com o `--eval` aparece só o resultado.

---

## 🔍 Exercício 4 — Não relacional (Consultas Avançadas)

### O que foi feito

- `updateOne()` com `$set` adicionando o campo `comentarios` (array de documentos com `autor`, `texto` e `data`) ao post "Schema flexível na prática".
- `find({ tags: "nosql" })`: consulta dentro de um array.
- `find({ autor: "João Silva" })`: consulta por um campo específico.
- **Extra**: `find({ "comentarios.autor": "Ana Costa" }, { _id: 0, titulo: 1 })`: consulta dentro de documentos aninhados, com projeção para retornar só o título.

### Como rodar

```bash
cd banco-de-dados
docker exec orion_mongo_db mongosh -u orion_admin -p orion_admin_pass \
  --quiet --eval "$(cat exercicio-4/exercicio-4.js)"
```

### Observações

- Depende dos dados do exercício 3.
- O `$set` substitui o array inteiro, então rodar o script de novo não duplica os comentários. Para acrescentar um comentário a um array que já existe, o operador seria o `$push`.
- Em um campo que é array, o filtro `{ tags: "nosql" }` encontra o documento se **qualquer** elemento do array for igual a `"nosql"`.
- O extra foi incluído porque a avaliação pede consultas dentro de arrays e também de documentos aninhados.
- **Enunciado**: os itens 2 e 3 do PDF misturam as consultas com a criação de `docker-compose.dev.yml` e `docker-compose.prod.yml`, e os critérios de sucesso falam de build Docker. Esses trechos parecem ter vindo de um exercício de Docker. Por isso, só a parte de MongoDB foi implementada.

---

## 🛠️ Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Bind for 0.0.0.0:5432 failed: port is already allocated` | Outro Postgres (de um exercício de Docker ou instalado na máquina) já usa a porta | Derrube o outro container com `docker compose down` na pasta dele ou pare o serviço local |
| `relation "alunos" does not exist` ao rodar o exercício 2 | O exercício 1 ainda não foi executado no banco | Rode o `exercicio-1.sql` antes |
| `Authentication failed` no `mongosh` ou no Compass | Faltou usuário e senha, ou o banco de autenticação não é o `admin` | Use a URI completa `mongodb://orion_admin:orion_admin_pass@localhost:27017/`; o usuário root é criado no banco `admin` |
| Credenciais alteradas no `docker-compose.yml` não funcionam | Os bancos só leem as variáveis de usuário e senha na primeira inicialização, com o volume vazio | `docker compose down -v` e `docker compose up -d` (apaga os dados) |

## 🔀 Fluxo de entrega

- **Gitflow**: cada exercício foi desenvolvido em uma branch `feature/banco-de-dados-exercicio-*` a partir da `develop` e integrado por pull request. A entrega final segue para a `main` por uma branch `release/*`.
- **Conventional Commits**: `feat` (scripts e READMEs dos exercícios) e `docs` (este README).

| PR | Branch | Conteúdo |
|---|---|---|
| #7 | `feature/docker-compose-database-containers-setup` | `docker-compose.yml` com Postgres e MongoDB |
| #8 | `feature/banco-de-dados-exercicio-1-relacional` | Exercício 1 |
| #9 | `feature/banco-de-dados-exercicio-2-relacional-joins-filtros` | Exercício 2 |
| #10 | `feature/banco-de-dados-exercicio-3-no-sql-crud` | Exercício 3 |
| #11 | `feature/banco-de-dados-exercicio-4-nosql-consultas-avancadas` | Exercício 4 |
