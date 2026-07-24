'use strict';

const pool = require('./config/database');
const { hashPassword } = require('./services/passwords');

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const tenantId = process.env.DEFAULT_TENANT_ID || process.env.TENANT_ID || 'default';
  if (!email || !password) throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');

  await pool.query(
    `INSERT INTO users (email, password_hash, name, role, tenant_id)
     VALUES ($1, $2, $3, 'admin', $4)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = 'admin',
           tenant_id = EXCLUDED.tenant_id`,
    [email.toLowerCase(), hashPassword(password), process.env.SEED_ADMIN_NAME || 'Runtime Administrator', tenantId]
  );
  console.log('administrator provisioned');
  await pool.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
