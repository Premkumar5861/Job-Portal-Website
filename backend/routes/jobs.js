const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// GET /api/jobs/recruiter/myjobs — MUST be BEFORE /:id route
router.get('/recruiter/myjobs', authMiddleware, roleMiddleware('recruiter', 'admin'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs - Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const { search, location, type, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } }
    ];
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ jobs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs - Create job (recruiter only)
router.post('/', authMiddleware, roleMiddleware('recruiter', 'admin'), async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements, skills, experience, deadline } = req.body;
    const job = new Job({
      title, company, location, type, salary,
      description, requirements, skills, experience, deadline,
      postedBy: req.user.id
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', authMiddleware, roleMiddleware('recruiter', 'admin'), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

