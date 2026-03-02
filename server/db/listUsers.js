import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'leaddork',
  password: process.env.DB_PASSWORD || 'leaddork_password',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function listUsers() {
  try {
    const { rows } = await pool.query('SELECT id, name, email FROM users');
    console.log('Users in database:');
    console.table(rows);
  } catch (err) {
    console.error('Failed to list users:', err);
  } finally {
    await pool.end();
  }
}

listUsers();
