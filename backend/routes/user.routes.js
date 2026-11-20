const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, role, phone, profile_picture FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    let profile = null;

    if (user.role === 'jobseeker') {
      const [profiles] = await db.query('SELECT * FROM seeker_profiles WHERE user_id = ?', [req.user.id]);
      profile = profiles[0] || null;
    } else if (user.role === 'employer') {
      const [profiles] = await db.query('SELECT * FROM employer_profiles WHERE user_id = ?', [req.user.id]);
      profile = profiles[0] || null;
    }

    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update seeker profile
router.put('/profile/seeker', verifyToken, async (req, res) => {
  try {
    const { headline, bio, skills, experience_years, education, location, linkedin_url, portfolio_url } = req.body;

    await db.query(
      `UPDATE seeker_profiles SET headline=?, bio=?, skills=?, experience_years=?,
       education=?, location=?, linkedin_url=?, portfolio_url=? WHERE user_id=?`,
      [headline, bio, skills, experience_years, education, location, linkedin_url, portfolio_url, req.user.id]
    );

    // Update base user info
    if (req.body.full_name || req.body.phone) {
      await db.query(
        'UPDATE users SET full_name=?, phone=? WHERE id=?',
        [req.body.full_name, req.body.phone, req.user.id]
      );
    }

    res.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employer profile
router.put('/profile/employer', verifyToken, async (req, res) => {
  try {
    const { company_name, company_website, industry, company_size, company_description, location } = req.body;

    await db.query(
      `UPDATE employer_profiles SET company_name=?, company_website=?, industry=?,
       company_size=?, company_description=?, location=? WHERE user_id=?`,
      [company_name, company_website, industry, company_size, company_description, location, req.user.id]
    );

    res.json({ message: 'Company profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get saved jobs
router.get('/saved-jobs', verifyToken, async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT j.*, ep.company_name, ep.company_logo, sj.saved_at
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
       WHERE sj.user_id = ?
       ORDER BY sj.saved_at DESC`,
      [req.user.id]
    );
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard stats
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'jobseeker') {
      const [applied] = await db.query('SELECT COUNT(*) as count FROM applications WHERE seeker_id = ?', [req.user.id]);
      const [shortlisted] = await db.query('SELECT COUNT(*) as count FROM applications WHERE seeker_id = ? AND status = "shortlisted"', [req.user.id]);
      const [saved] = await db.query('SELECT COUNT(*) as count FROM saved_jobs WHERE user_id = ?', [req.user.id]);
      stats = {
        total_applied: applied[0].count,
        shortlisted: shortlisted[0].count,
        saved_jobs: saved[0].count,
      };
    } else if (req.user.role === 'employer') {
      const [jobs] = await db.query('SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?', [req.user.id]);
      const [activeJobs] = await db.query('SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = "active"', [req.user.id]);
      const [applications] = await db.query(
        'SELECT COUNT(*) as count FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.employer_id = ?',
        [req.user.id]
      );
      stats = {
        total_jobs: jobs[0].count,
        active_jobs: activeJobs[0].count,
        total_applications: applications[0].count,
      };
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
