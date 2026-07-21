const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load this project's .env first, then fall back to canonical OpenRouter env.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aquaculture_farm',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  }),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
