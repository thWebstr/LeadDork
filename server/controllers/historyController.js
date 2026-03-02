import pool from '../config/db.js';

export const getSearchHistory = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM search_history WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, history: rows });
  } catch (err) {
    next(err);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM search_history WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'History item not found' });
    }
    
    res.json({ success: true, message: 'History item deleted' });
  } catch (error) {
    next(error);
  }
};
