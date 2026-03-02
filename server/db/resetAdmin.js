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

async function resetAdmin() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
      [hash, 'admin@leaddork.com']
    );

    if (res.rowCount === 0) {
      console.log('Admin user not found. Creating it...');
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', 'admin@leaddork.com', hash, 'admin']
      );
    }

    console.log('Admin password reset successfully to: admin123');
  } catch (err) {
    console.error('Failed to reset admin password:', err);
  } finally {
    await pool.end();
  }
}

resetAdmin();
