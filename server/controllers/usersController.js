import pool from '../config/db.js';

export const getUserSettings = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users ORDER BY id ASC LIMIT 1`);
    
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
       WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1)
       RETURNING *`,
      [name, role, avatar_url]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};
