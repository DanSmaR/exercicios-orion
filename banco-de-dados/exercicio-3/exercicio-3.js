// =================================================================
// Exercício 3 — Não relacional (CRUD Básico)
// Banco: MongoDB (container orion_mongo_db)
//
// Como executar:
//   - No MongoDB Compass: abra o "MONGOSH" (shell embutido) e cole
//     os comandos abaixo.
//   - Pelo terminal:
//     docker exec orion_mongo_db mongosh -u orion_admin \
//       -p orion_admin_pass --quiet --eval "$(cat exercicio-3/exercicio-3.js)"
// =================================================================

// Seleciona (e cria, se não existir) o banco do blog
db = db.getSiblingDB("orion_blog");

// Permite rodar o script várias vezes do zero
db.posts.drop();

// -----------------------------------------------------------------
// 1. Criar a coleção "posts"
// (O Mongo também criaria automaticamente no primeiro insert.)
// -----------------------------------------------------------------
db.createCollection("posts");

// -----------------------------------------------------------------
// 2. Create: documento com titulo, autor e conteudo
// -----------------------------------------------------------------
db.posts.insertOne({
  titulo: "Introdução ao MongoDB",
  autor: "João Silva",
  conteudo: "O MongoDB é um banco de dados NoSQL orientado a documentos."
});

// -----------------------------------------------------------------
// 3. Schema flexível: mesmo formato + campo novo "tags" (array)
// A coleção aceita o documento sem nenhuma alteração de estrutura.
// -----------------------------------------------------------------
db.posts.insertOne({
  titulo: "Schema flexível na prática",
  autor: "Maria Souza",
  conteudo: "Documentos da mesma coleção podem ter campos diferentes.",
  tags: ["nosql", "flexivel"]
});

// -----------------------------------------------------------------
// 4. Read: listar todos os documentos da coleção
// -----------------------------------------------------------------
printjson(db.posts.find().toArray());
