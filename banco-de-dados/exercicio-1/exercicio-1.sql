-- =================================================================
-- Exercício 1 — Banco relacional (SQL Básico)
-- Banco: PostgreSQL (container orion_postgres_db / banco orion_db)
-- =================================================================

DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS cursos;


CREATE TABLE cursos (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_curso VARCHAR(100) NOT NULL
);

CREATE TABLE alunos (
    id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL UNIQUE,
    curso_id INTEGER NOT NULL,
    CONSTRAINT fk_alunos_cursos
        FOREIGN KEY (curso_id) REFERENCES cursos (id)
);

INSERT INTO cursos (nome_curso) VALUES
    ('Desenvolvimento Web'),
    ('Ciência de Dados'),
    ('DevOps');

INSERT INTO alunos (nome, email, curso_id) VALUES
    ('João Silva',     'joao.silva@email.com',     1),
    ('Maria Souza',    'maria.souza@email.com',    1),
    ('Pedro Oliveira', 'pedro.oliveira@email.com', 2),
    ('Ana Costa',      'ana.costa@email.com',      2);

SELECT * FROM alunos;

-- -----------------------------------------------------------------
-- Teste da Chave Estrangeira
-- -----------------------------------------------------------------

-- INSERT INTO alunos (nome, email, curso_id)
-- VALUES ('Aluno Inválido', 'invalido@email.com', 99);
