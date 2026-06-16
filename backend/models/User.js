const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'recruiter', 'admin'], default: 'jobseeker' },
  phone: { type: String },
  location: { type: String },
  skills: [String],
  resume: { type: String }, // file path
  profilePic: { type: String },
  company: { type: String }, // for recruiters
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
