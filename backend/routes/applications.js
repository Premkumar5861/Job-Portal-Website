const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");



// POST /api/applications - Apply for a job
router.post(
  "/",
  authMiddleware,
  roleMiddleware("jobseeker"),
  async (req, res) => {
    try {
      const { jobId, coverLetter } = req.body;

      // Check if already applied
      const existing = await Application.findOne({
        job: jobId,
        applicant: req.user.id,
      });
      if (existing)
        return res
          .status(400)
          .json({ message: "Already applied for this job" });

      const application = new Application({
        job: jobId,
        applicant: req.user.id,
        coverLetter,
      });
      await application.save();

      // Add applicant to job
      await Job.findByIdAndUpdate(jobId, {
        $push: { applicants: req.user.id },
      });

      res.status(201).json(application);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// GET /api/applications/my - Get my applications (job seeker)
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("jobseeker"),
  async (req, res) => {
    try {
      const applications = await Application.find({ applicant: req.user.id })
        .populate("job", "title company location type salary")
        .sort({ appliedAt: -1 });
      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET /api/applications/job/:jobId - Get all applicants for a job (recruiter)
router.get(
  "/job/:jobId",
  authMiddleware,
  roleMiddleware("recruiter", "admin"),
  async (req, res) => {
    try {
      const applications = await Application.find({ job: req.params.jobId })
        .populate("applicant", "name email phone skills resume location")
        .sort({ appliedAt: -1 });
      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PUT /api/applications/:id/status - Update application status (recruiter)
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("recruiter", "admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true },
      );
      res.json(application);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
