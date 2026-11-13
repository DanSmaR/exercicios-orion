## Exercício 3 — Não relacional (CRUD Básico)

### 1. Criar uma coleção chamada **posts** no banco de dados.
![print mongoDB Compass criar coleção posts](images/image.png)

### 2. Inserir (Create):
 - Insira um documento com: titulo, autor e conteudo.
 ![print mongoDB Compass inserir documento](images/image-1.png)
 ![print mongoDB Compass documento inserido](images/image-2.png)

 ### 3. Testar Schema Flexível:
  - Insira um segundo documento com: titulo, autor, conteudo e um campo novo: tags (um array de strings, ex: ["nosql", "flexivel"]).
  ![print mongoDB Compass inserir documento com um campo a mais](images/image-3.png)
  ![print mongoDB Compass documento inserido](images/image-4.png)

### 4. Consultar (Read):
  - Use o comando find() para listar todos os documentos da coleção posts.
  ![print mongoDB Compass resultado consulta find](images/image-5.png)