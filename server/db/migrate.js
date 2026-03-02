import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'leaddork',
  password: process.env.DB_PASSWORD || 'leaddork_password',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Ensuring users table structure...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(255),
        email        VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role         VARCHAR(100),
        avatar_url   TEXT,
        created_at   TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure columns exist if table was created previously
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');

    // Create a default admin user if no users exist
    const { rows: userRows } = await client.query('SELECT * FROM users LIMIT 1');
    let defaultUserId;
    if (userRows.length === 0 || !userRows.find(u => u.email === 'admin@leaddork.com')) {
      console.log('Creating default admin user...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      
      const res = await client.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id',
        ['Admin User', 'admin@leaddork.com', hash, 'admin']
      );
      defaultUserId = res.rows[0]?.id || (await client.query('SELECT id FROM users WHERE email = $1', ['admin@leaddork.com'])).rows[0].id;
    } else {
      defaultUserId = userRows[0].id;
    }

    console.log('Adding user_id to leads...');
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE
    `);
    await client.query(`UPDATE leads SET user_id = $1 WHERE user_id IS NULL`, [defaultUserId]);
    
    // Fix unique constraint on leads
    await client.query(`ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_linkedin_url_key`);
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_lead') THEN
          ALTER TABLE leads ADD CONSTRAINT unique_user_lead UNIQUE (user_id, linkedin_url);
        END IF;
      END $$;
    `);

    console.log('Adding user_id to tags...');
    await client.query(`
      ALTER TABLE tags ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE
    `);
    await client.query(`UPDATE tags SET user_id = $1 WHERE user_id IS NULL`, [defaultUserId]);
    await client.query(`ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key`);
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_tag') THEN
          ALTER TABLE tags ADD CONSTRAINT unique_user_tag UNIQUE (user_id, name);
        END IF;
      END $$;
    `);

    console.log('Adding user_id to search_history...');
    await client.query(`
      ALTER TABLE search_history ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE
    `);
    await client.query(`UPDATE search_history SET user_id = $1 WHERE user_id IS NULL`, [defaultUserId]);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
