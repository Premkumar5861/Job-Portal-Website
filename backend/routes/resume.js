const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files allowed'));
  }
});

// POST /api/resume/upload
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Delete old resume file if exists
    const existingUser = await User.findById(req.user.id);
    if (existingUser.resume) {
      const oldPath = path.join(__dirname, '..', existingUser.resume);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const resumePath = `/uploads/resumes/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { resume: resumePath },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Resume uploaded successfully',
      path: resumePath,
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// DELETE /api/resume
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.resume) {
      const filePath = path.join(__dirname, '..', user.resume);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await User.findByIdAndUpdate(req.user.id, { resume: null });
    }
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;