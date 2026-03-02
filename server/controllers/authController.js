import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'leaddork_super_secret_key_123';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check if user exists
    const { rows: existing } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(cleanPassword, salt);

    // Create user
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, cleanEmail, password_hash, 'user']
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    console.log(`[AUTH] Login attempt for: ${cleanEmail}`);

    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (rows.length === 0) {
      console.log(`[AUTH] User not found (case-insensitive): ${cleanEmail}`);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = rows[0];
    console.log(`[AUTH] User found: ${user.email}. Comparing hash...`);
    
    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isMatch) {
      console.log(`[AUTH] Password mismatch for: ${cleanEmail}`);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    console.log(`[AUTH] Login successful: ${email}`);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Don't send password hash back
    delete user.password_hash;

    res.json({ success: true, user, token });
  } catch (err) {
    console.error(`[AUTH] Login crash:`, err);
    next(err);
  }
};
