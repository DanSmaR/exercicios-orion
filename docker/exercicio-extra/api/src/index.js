const express = require('express');
const { pool, initSchema } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Docker! API + PostgreSQL + Adminer',
    environment: process.env.NODE_ENV,
    routes: ['GET /health', 'GET /items', 'POST /items'],
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

app.get('/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list items' });
  }
});

app.post('/items', async (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'Field "name" is required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// O healthcheck do Compose garante que o banco já aceita conexões neste ponto
async function start() {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT} (${process.env.NODE_ENV})`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
