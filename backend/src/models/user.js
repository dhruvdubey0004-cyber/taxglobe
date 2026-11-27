const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Founder', 'CA', 'Admin'], default: 'User' },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);