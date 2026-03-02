// Phase 3 database update to implement User Profiles for settings
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrateUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert a default user if none exists
    const { rows } = await pool.query(`SELECT COUNT(*) FROM users;`);
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO users (name, role, avatar_url) 
        VALUES ('Admin User', 'Growth Team', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')
      `);
      console.log('Default user seeded.');
    } else {
      console.log('Users table already exists and is populated.');
    }
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    pool.end();
  }
}

migrateUsersTable();
