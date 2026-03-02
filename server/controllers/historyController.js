import pool from '../config/db.js';

export const getHistory = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM search_history ORDER BY created_at DESC');
    res.json({ success: true, history: rows });
  } catch (error) {
    next(error);
  }
};

export const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM search_history WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'History item not found' });
    }
    
    res.json({ success: true, message: 'History item deleted' });
  } catch (error) {
    next(error);
  }
};
