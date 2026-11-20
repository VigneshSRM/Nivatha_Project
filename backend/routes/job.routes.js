const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');

// Get all jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, job_type, location, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT j.*, u.full_name AS employer_name, ep.company_name, ep.company_logo
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      LEFT JOIN employer_profiles ep ON u.id = ep.user_id
      WHERE j.status = 'active'
    `;
    const params = [];

    if (search) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ? OR ep.company_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { query += ` AND j.category = ?`; params.push(category); }
    if (job_type) { query += ` AND j.job_type = ?`; params.push(job_type); }
    if (location) { query += ` AND j.location LIKE ?`; params.push(`%${location}%`); }

    query += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [jobs] = await db.query(query, params);

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM jobs j 
       LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
       WHERE j.status = 'active'`
    );

    res.json({
      jobs,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    await db.query('UPDATE jobs SET views = views + 1 WHERE id = ?', [req.params.id]);

    const [jobs] = await db.query(
      `SELECT j.*, u.full_name AS employer_name, ep.company_name, ep.company_logo, 
       ep.company_website, ep.industry, ep.company_size, ep.company_description
       FROM jobs j
       JOIN users u ON j.employer_id = u.id
       LEFT JOIN employer_profiles ep ON u.id = ep.user_id
       WHERE j.id = ?`,
      [req.params.id]
    );

    if (jobs.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.json({ job: jobs[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job (Employer only)
router.post('/', verifyToken, isEmployer, async (req, res) => {
  try {
    const {
      title, description, requirements, skills_required, job_type,
      category, location, salary_min, salary_max, experience_required,
      education_required, deadline
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, skills_required,
       job_type, category, location, salary_min, salary_max, experience_required,
       education_required, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, requirements, skills_required, job_type,
       category, location, salary_min, salary_max, experience_required,
       education_required, deadline]
    );

    res.status(201).json({ message: 'Job posted successfully!', jobId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job
router.put('/:id', verifyToken, isEmployer, async (req, res) => {
  try {
    const { title, description, requirements, skills_required, job_type,
      category, location, salary_min, salary_max, experience_required,
      education_required, deadline, status } = req.body;

    await db.query(
      `UPDATE jobs SET title=?, description=?, requirements=?, skills_required=?, 
       job_type=?, category=?, location=?, salary_min=?, salary_max=?,
       experience_required=?, education_required=?, deadline=?, status=?
       WHERE id = ? AND employer_id = ?`,
      [title, description, requirements, skills_required, job_type, category, location,
       salary_min, salary_max, experience_required, education_required, deadline, status,
       req.params.id, req.user.id]
    );

    res.json({ message: 'Job updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job
router.delete('/:id', verifyToken, isEmployer, async (req, res) => {
  try {
    await db.query('DELETE FROM jobs WHERE id = ? AND employer_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Job deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employer's own jobs
router.get('/employer/myjobs', verifyToken, isEmployer, async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT j.*, 
       (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS application_count
       FROM jobs j WHERE j.employer_id = ? ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save / Unsave job
router.post('/:id/save', verifyToken, async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?',
      [req.user.id, req.params.id]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [req.user.id, req.params.id]);
      return res.json({ message: 'Job removed from saved', saved: false });
    }

    await db.query('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    res.json({ message: 'Job saved successfully', saved: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
