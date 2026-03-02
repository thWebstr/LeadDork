import pool from '../config/db.js';

export const getAllLeads = async (req, res, next) => {
  try {
    const { tag, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT l.*, COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
      FROM leads l
      LEFT JOIN lead_tags lt ON l.id = lt.lead_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      WHERE l.user_id = $1
    `;
    const queryParams = [userId];
    
    if (tag) {
      query += ` AND EXISTS (
        SELECT 1 FROM lead_tags lt2 
        JOIN tags t2 ON lt2.tag_id = t2.id 
        WHERE lt2.lead_id = l.id AND t2.name = $2 AND t2.user_id = $1
      )`;
      queryParams.push(tag);
    }
    
    query += ` GROUP BY l.id ORDER BY l.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const { rows } = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT l.id) as total FROM leads l WHERE l.user_id = $1';
    const countParams = [userId];
    if (tag) {
      countQuery += ` AND EXISTS (SELECT 1 FROM lead_tags lt JOIN tags t ON lt.tag_id = t.id WHERE lt.lead_id = l.id AND t.name = $2 AND t.user_id = $1)`;
      countParams.push(tag);
    }
    const { rows: countRows } = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      leads: rows,
      total: parseInt(countRows[0].total)
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, linkedin_url, title, company, location, notes, tags = [] } = req.body;
    const userId = req.user.id;
    
    await client.query('BEGIN');
    
    // Insert Lead
    const leadQuery = `
      INSERT INTO leads (user_id, name, linkedin_url, title, company, location, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const { rows } = await client.query(leadQuery, [userId, name, linkedin_url, title, company, location, notes]);
    const lead = rows[0];

    // Handle Tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagRes = await client.query(`
          INSERT INTO tags (user_id, name) VALUES ($1, $2)
          ON CONFLICT (user_id, name) DO UPDATE SET name=EXCLUDED.name
          RETURNING id
        `, [userId, tagName]);
        
        const tagId = tagRes.rows[0].id;
        
        // Link tag to lead
        await client.query(`
          INSERT INTO lead_tags (lead_id, tag_id) VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [lead.id, tagId]);
      }
    }
    
    await client.query('COMMIT');
    
    lead.tags = tags;
    res.status(201).json({ success: true, lead });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') { // unique violation code
      return res.status(409).json({ success: false, error: 'Lead with this LinkedIn URL already exists' });
    }
    next(error);
  } finally {
    client.release();
  }
};

export const updateLead = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { notes, tags } = req.body;
    const userId = req.user.id;
    
    await client.query('BEGIN');
    
    if (notes !== undefined) {
      await client.query('UPDATE leads SET notes = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [notes, id, userId]);
    }
    
    if (tags && Array.isArray(tags)) {
      // Clear all existing tags
      await client.query('DELETE FROM lead_tags WHERE lead_id = $1', [id]);
      
      // Insert new tags
      for (const tagName of tags) {
        const tagRes = await client.query(`
          INSERT INTO tags (user_id, name) VALUES ($1, $2)
          ON CONFLICT (user_id, name) DO UPDATE SET name=EXCLUDED.name
          RETURNING id
        `, [userId, tagName]);
        
        const tagId = tagRes.rows[0].id;
        await client.query('INSERT INTO lead_tags (lead_id, tag_id) VALUES ($1, $2)', [id, tagId]);
      }
    }
    
    // Fetch updated lead
    const { rows } = await client.query(`
      SELECT l.*, COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
      FROM leads l
      LEFT JOIN lead_tags lt ON l.id = lt.lead_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      WHERE l.id = $1 AND l.user_id = $2
      GROUP BY l.id
    `, [id, userId]);
    
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    
    await client.query('COMMIT');
    res.json({ success: true, lead: rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rowCount } = await pool.query('DELETE FROM leads WHERE id = $1 AND user_id = $2', [id, userId]);
    
    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    
    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    next(error);
  }
};
