import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'leaddork',
  password: process.env.DB_PASSWORD || 'leaddork_password',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function verifyHash() {
  try {
    const email = 'admin@leaddork.com';
    const password = 'admin123';
    
    console.log(`Checking user: ${email}`);
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      console.log('User not found in database.');
      return;
    }

    const user = rows[0];
    console.log('User found. Password hash from DB:', user.password_hash);
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Bcrypt compare result for "${password}": ${isMatch}`);

    if (!isMatch) {
      console.log('Attempting to re-hash and verify...');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      console.log('New hash generated:', newHash);
      const verifyNew = await bcrypt.compare(password, newHash);
      console.log(`Verify newly generated hash: ${verifyNew}`);
    }

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await pool.end();
  }
}

verifyHash();
