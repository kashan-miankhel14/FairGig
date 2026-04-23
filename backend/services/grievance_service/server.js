/**
 * FairGig Grievance Service - Express.js backend
 * Handles grievance posting, moderation, community engagement, and advocacy workflows
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const app = express();
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://user:password@localhost/fairgig'
});

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const query = (text, params) => pool.query(text, params);

// ==================== HEALTH ====================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'grievance-service' });
});

// ==================== CREATE GRIEVANCE ====================
app.post('/grievances', async (req, res) => {
  const { worker_id, platform, title, description, category, severity } = req.body;
  try {
    const result = await query(
      `INSERT INTO grievances (worker_id, platform, title, description, category, severity, status, likes_count, comments_count)
       VALUES ($1, $2, $3, $4, $5, $6, 'open', 0, 0)
       RETURNING id, worker_id, title, description, status, created_at`,
      [worker_id, platform, title, description, category || 'general', severity || 'medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating grievance:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LIST GRIEVANCES ====================
app.get('/grievances', async (req, res) => {
  const { status, platform, limit = 20, offset = 0 } = req.query;
  try {
    const conditions = [];
    const params = [];
    let i = 1;

    if (status) { conditions.push(`g.status = $${i++}`); params.push(status); }
    if (platform) { conditions.push(`g.platform = $${i++}`); params.push(platform); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(
      `SELECT g.id, g.worker_id, g.platform, g.title, g.description, g.category,
              g.severity, g.status, g.likes_count, g.comments_count, g.created_at,
              u.full_name, u.city
       FROM grievances g
       JOIN users u ON g.worker_id = u.id
       ${where}
       ORDER BY g.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching grievances:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== GET SINGLE GRIEVANCE ====================
app.get('/grievances/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const gResult = await query(
      `SELECT g.*, u.full_name, u.email, u.city
       FROM grievances g JOIN users u ON g.worker_id = u.id
       WHERE g.id = $1`,
      [id]
    );
    if (!gResult.rows.length) return res.status(404).json({ error: 'Not found' });

    const cResult = await query(
      `SELECT gc.id, gc.user_id, gc.content, gc.likes_count, gc.created_at, u.full_name, u.role
       FROM grievance_comments gc JOIN users u ON gc.user_id = u.id
       WHERE gc.grievance_id = $1 ORDER BY gc.created_at DESC`,
      [id]
    );
    const grievance = gResult.rows[0];
    grievance.comments = cResult.rows;
    res.json(grievance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADD COMMENT ====================
app.post('/grievances/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;
  try {
    const result = await query(
      `INSERT INTO grievance_comments (grievance_id, user_id, content, is_moderated)
       VALUES ($1, $2, $3, false) RETURNING id, user_id, content, created_at`,
      [id, user_id, content]
    );
    await query(`UPDATE grievances SET comments_count = comments_count + 1 WHERE id = $1`, [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== LIKE ====================
app.post('/grievances/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `UPDATE grievances SET likes_count = likes_count + 1 WHERE id = $1 RETURNING id, likes_count`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ASSIGN ====================
app.post('/grievances/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { advocate_id, status } = req.body;
  try {
    const result = await query(
      `UPDATE grievances SET assigned_advocate_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING id, assigned_advocate_id, status`,
      [advocate_id, status || 'in_review', id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RESOLVE ====================
app.post('/grievances/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { resolution_notes } = req.body;
  try {
    const result = await query(
      `UPDATE grievances SET status = 'resolved', resolution_notes = $1,
       resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING id, status, resolved_at`,
      [resolution_notes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== STATS ====================
app.get('/stats', async (req, res) => {
  try {
    const [platformStats, severityStats, recentCases] = await Promise.all([
      query(`SELECT platform, COUNT(*) as total_grievances,
             SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
             FROM grievances WHERE platform IS NOT NULL GROUP BY platform ORDER BY total_grievances DESC`),
      query(`SELECT severity, COUNT(*) as count,
             SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
             FROM grievances GROUP BY severity`),
      query(`SELECT id, title, platform, status, created_at FROM grievances ORDER BY created_at DESC LIMIT 10`)
    ]);
    res.json({
      platform_stats: platformStats.rows,
      severity_stats: severityStats.rows,
      recent_cases: recentCases.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MODERATION ====================
app.get('/moderation/flagged', async (req, res) => {
  try {
    const result = await query(
      `SELECT gc.*, g.title, u.full_name FROM grievance_comments gc
       JOIN grievances g ON gc.grievance_id = g.id
       JOIN users u ON gc.user_id = u.id
       WHERE gc.is_flagged = true OR gc.is_moderated = false
       ORDER BY gc.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/moderation/comments/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `UPDATE grievance_comments SET is_moderated = true, is_flagged = false WHERE id = $1 RETURNING id, is_moderated`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/moderation/comments/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    const cr = await query('SELECT grievance_id FROM grievance_comments WHERE id = $1', [id]);
    if (!cr.rows.length) return res.status(404).json({ error: 'Not found' });
    const gid = cr.rows[0].grievance_id;
    await query('DELETE FROM grievance_comments WHERE id = $1', [id]);
    await query('UPDATE grievances SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1', [gid]);
    res.json({ status: 'deleted', comment_id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => console.log(`Grievance Service running on port ${PORT}`));
