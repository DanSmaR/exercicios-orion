# Exercícios Orion

Repositório de entrega dos exercícios do bootcamp Orion.

## Conteúdos

| Conteúdo | Exercício | Descrição |
|---|---|---|
| Docker | [Visão geral](docker/README.md) | Resumo, como rodar e observações de todos os exercícios |
| Docker | [exercicio-1](docker/exercicio-1) | Dockerfile + Compose: "Hello Container" |
| Docker | [exercicio-2](docker/exercicio-2) | Compose com API + Banco de Dados |
| Docker | [exercicio-3](docker/exercicio-3) | Boas práticas + múltiplos ambientes |
| Docker | [exercicio-extra](docker/exercicio-extra) | Aplicação completa com Docker Compose |
| Banco de Dados | [Visão geral](banco-de-dados/README.md) | Ambiente, resumo, como rodar e observações de todos os exercícios |
| Banco de Dados | [exercicio-1](banco-de-dados/exercicio-1) | Relacional: SQL básico (PostgreSQL) |
| Banco de Dados | [exercicio-2](banco-de-dados/exercicio-2) | Relacional: JOINs e filtros (PostgreSQL) |
| Banco de Dados | [exercicio-3](banco-de-dados/exercicio-3) | Não relacional: CRUD básico (MongoDB) |
| Banco de Dados | [exercicio-4](banco-de-dados/exercicio-4) | Não relacional: consultas avançadas (MongoDB) |

## Fluxo de trabalho

- **Gitflow**: `feature/*` → `develop` → `release/*` → `main` (via pull request).
- **Conventional Commits**: `feat`, `fix`, `build`, `chore`, `docs`, `refactor`...

## Pré-requisitos

- Docker 24+
- Docker Compose v2.24.4+ (`docker compose`)
- Para os exercícios de banco de dados: um cliente SQL (ex: DBeaver) e o MongoDB Compass (opcionais; os scripts também rodam pelo terminal)
