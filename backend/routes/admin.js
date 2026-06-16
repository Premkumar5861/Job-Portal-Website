const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const adminOnly = [authMiddleware, roleMiddleware('admin')];

// GET /api/admin/stats
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApplications, jobSeekers, recruiters] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'recruiter' }),
    ]);
    res.json({ totalUsers, totalJobs, totalApplications, jobSeekers, recruiters });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', ...adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', ...adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', ...adminOnly, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/jobs/:id/toggle
router.put('/jobs/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    job.isActive = !job.isActive;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;