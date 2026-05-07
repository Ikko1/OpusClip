const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clips (
      id SERIAL PRIMARY KEY,
      video_id TEXT,
      title TEXT,
      explanation TEXT,
      url TEXT,
      thumbnail_url TEXT,
      start_time FLOAT,
      end_time FLOAT,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      clip_id INTEGER REFERENCES clips(id),
      publish_at TIMESTAMP,
      platform TEXT,
      status TEXT DEFAULT 'pending',
      tokens JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = {
  pool,
  initDb
};
