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

async function repairUsersTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Altering users table...');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');
    
    // Set them as NOT NULL after adding (with a default if needed, but since it's a new setup we'll just allow it for now and set values)
    
    await client.query('COMMIT');
    console.log('Users table repaired successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to repair users table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

repairUsersTable();
