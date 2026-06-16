const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String },
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
