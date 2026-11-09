const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// O depends_on garante só a ordem de start, não que o Postgres já aceite conexões
async function waitForDatabase(retries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log(`Connected to database at ${process.env.DB_HOST}`);
      return;
    } catch (err) {
      console.log(`Database not ready (attempt ${attempt}/${retries}): ${err.message}`);
      await sleep(delayMs);
    }
  }
  throw new Error('Could not connect to the database');
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { pool, waitForDatabase, initSchema };
