import pool from '../config/db.js';

export const getUserSettings = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1`, [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateUserSettings = async (req, res, next) => {
  try {
    const { name, role, avatar_url } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, avatar_url = $3 
       WHERE id = $4
       RETURNING id, name, email, role, avatar_url, created_at`,
      [name, role, avatar_url, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};
