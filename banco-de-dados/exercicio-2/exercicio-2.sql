-- =================================================================
-- Exercício 2 — Banco relacional (JOINs e Filtros)
-- Banco: PostgreSQL (container orion_postgres_db / banco orion_db)
-- Pré-requisito: executar antes o exercicio-1/exercicio-1.sql
-- =================================================================

-- -----------------------------------------------------------------
-- 1. INNER JOIN: nome do aluno + nome do curso que ele faz
-- -----------------------------------------------------------------
SELECT a.nome       AS aluno,
       c.nome_curso AS curso
FROM alunos a
INNER JOIN cursos c ON c.id = a.curso_id
ORDER BY a.nome;

-- -----------------------------------------------------------------
-- 2. JOIN + WHERE: apenas os alunos do curso "Desenvolvimento Web"
-- -----------------------------------------------------------------
SELECT a.nome       AS aluno,
       c.nome_curso AS curso
FROM alunos a
INNER JOIN cursos c ON c.id = a.curso_id
WHERE c.nome_curso = 'Desenvolvimento Web'
ORDER BY a.nome;

-- -----------------------------------------------------------------
-- 3. UPDATE: mover Maria para o curso de Ciência de Dados
-- O curso_id é buscado pelo nome do curso (subconsulta), sem
-- depender de saber o id de cabeça.
-- -----------------------------------------------------------------
UPDATE alunos
SET curso_id = (SELECT id FROM cursos WHERE nome_curso = 'Ciência de Dados')
WHERE email = 'maria.souza@email.com';

-- Novo SELECT com JOIN para conferir a mudança
SELECT a.nome       AS aluno,
       c.nome_curso AS curso
FROM alunos a
INNER JOIN cursos c ON c.id = a.curso_id
ORDER BY a.nome;

-- -----------------------------------------------------------------
-- Extra (avançado): cursos sem nenhum aluno matriculado
-- O LEFT JOIN mantém todos os cursos; os que não têm aluno
-- correspondente ficam com a.id NULL e são filtrados pelo WHERE.
-- -----------------------------------------------------------------
SELECT c.id,
       c.nome_curso
FROM cursos c
LEFT JOIN alunos a ON a.curso_id = c.id
WHERE a.id IS NULL;
