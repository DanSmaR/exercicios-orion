// Exercício 4 — Não relacional (Consultas Avançadas)

db = db.getSiblingDB("orion_blog");

// -----------------------------------------------------------------
// 1. Update: adicionar o campo "comentarios" (array de documentos)
// em um dos posts. $set torna o comando seguro para rodar de novo:
// ele sobrescreve o array em vez de duplicar comentários.
// -----------------------------------------------------------------
db.posts.updateOne(
  { titulo: "Schema flexível na prática" },
  {
    $set: {
      comentarios: [
        { autor: "Pedro Oliveira", texto: "Ótima explicação!", data: new Date("2026-11-10") },
        { autor: "Ana Costa",      texto: "Não sabia que dava pra misturar campos.", data: new Date("2026-11-11") }
      ]
    }
  }
);

// -----------------------------------------------------------------
// 2. Consulta dentro de um array: posts com a tag "nosql"
// Em um campo array, { tags: "nosql" } casa se QUALQUER elemento
// do array for igual a "nosql".
// -----------------------------------------------------------------
db.posts.find({ tags: "nosql" }).toArray();

// -----------------------------------------------------------------
// 3. Consulta por campo específico: posts de um autor
// -----------------------------------------------------------------
db.posts.find({ autor: "João Silva" }).toArray();

// -----------------------------------------------------------------
// 4. Consulta por campo dentro de um array: posts com comentários de Ana Costa
// -----------------------------------------------------------------
db.posts.find(
  { "comentarios.autor": "Ana Costa" },
  { _id: 0, titulo: 1 }
).toArray()
