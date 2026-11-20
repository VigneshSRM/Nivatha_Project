const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');

// Apply for a job (Job Seeker)
router.post('/:jobId/apply', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }

    const { cover_letter, resume_url } = req.body;
    const { jobId } = req.params;

    // Check if already applied
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE job_id = ? AND seeker_id = ?',
      [jobId, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    const [result] = await db.query(
      'INSERT INTO applications (job_id, seeker_id, cover_letter, resume_url) VALUES (?, ?, ?, ?)',
      [jobId, req.user.id, cover_letter, resume_url]
    );

    // Notify employer
    const [jobs] = await db.query('SELECT employer_id, title FROM jobs WHERE id = ?', [jobId]);
    if (jobs.length > 0) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [jobs[0].employer_id, 'New Application', `Someone applied for "${jobs[0].title}"`, 'application']
      );
    }

    res.status(201).json({ message: 'Application submitted successfully!', applicationId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seeker's applications
router.get('/my-applications', verifyToken, async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*, j.title AS job_title, j.job_type, j.location, j.salary_min, j.salary_max,
       ep.company_name, ep.company_logo
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
       WHERE a.seeker_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for a job (Employer)
router.get('/job/:jobId', verifyToken, isEmployer, async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*, u.full_name, u.email, u.phone, u.profile_picture,
       sp.headline, sp.skills, sp.experience_years, sp.education
       FROM applications a
       JOIN users u ON a.seeker_id = u.id
       LEFT JOIN seeker_profiles sp ON u.id = sp.user_id
       WHERE a.job_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.jobId]
    );
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (Employer)
router.put('/:id/status', verifyToken, isEmployer, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);

    // Notify seeker
    const [apps] = await db.query(
      `SELECT a.seeker_id, j.title FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?`,
      [req.params.id]
    );

    if (apps.length > 0) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [apps[0].seeker_id, 'Application Update',
         `Your application for "${apps[0].title}" has been ${status}`, 'status_update']
      );
    }

    res.json({ message: `Application status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
