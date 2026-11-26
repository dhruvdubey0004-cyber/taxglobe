// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Onboarding = require('../models/onboarding');
const OTP = require('../models/otp');
const Treaty = require('../models/treaty');
const Simulation = require('../models/simulation');

// Helper – allow only admin users
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'Admin') return next();
  return res.status(403).json({ success: false, message: 'Admin only' });
}

// ── OVERALL STATS ────────────────────────────────────────────────
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [userCount, onboardingCount, verifiedOnboardingCount, otpCount, treatyCount, simulationCount] = await Promise.all([
      User.countDocuments(),
      Onboarding.countDocuments(),
      Onboarding.countDocuments({ emailVerified: true }),
      OTP.countDocuments(),
      Treaty.countDocuments(),
      Simulation.countDocuments()
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const leadsByBusinessType = await Onboarding.aggregate([
      { $group: { _id: '$businessType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          onboarding: onboardingCount,
          verifiedOnboarding: verifiedOnboardingCount,
          otps: otpCount,
          treaties: treatyCount,
          simulations: simulationCount
        },
        usersByRole,
        leadsByBusinessType
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── USERS ────────────────────────────────────────────────────────
router.get('/users', auth, requireAdmin, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// POST /api/admin/users — Create a new user
router.post('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const validRoles = ['User', 'Founder', 'CA', 'Admin'];
    const userRole = validRoles.includes(role) ? role : 'User';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/users/:id/role', auth, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['User', 'Founder', 'CA', 'Admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  res.json({ success: true, data: user });
});

router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User removed' });
});

// ── ONBOARDING PROFILES ───────────────────────────────────────────
router.get('/onboarding', auth, requireAdmin, async (req, res) => {
  const profiles = await Onboarding.find().sort({ createdAt: -1 });
  res.json({ success: true, data: profiles });
});

router.delete('/onboarding/:id', auth, requireAdmin, async (req, res) => {
  await Onboarding.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Onboarding entry removed' });
});

// ── OTP LOGS (debug / audit) ───────────────────────────────────────
router.get('/otps', auth, requireAdmin, async (req, res) => {
  const otps = await OTP.find().sort({ createdAt: -1 });
  res.json({ success: true, data: otps });
});

router.delete('/otps/:id', auth, requireAdmin, async (req, res) => {
  await OTP.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'OTP entry removed' });
});

// ── READ‑ONLY DATA: TREATIES & SIMULATIONS ────────────────────────
router.get('/treaties', auth, requireAdmin, async (req, res) => {
  const treaties = await Treaty.find().sort({ createdAt: -1 });
  res.json({ success: true, data: treaties });
});

router.get('/simulations', auth, requireAdmin, async (req, res) => {
  const sims = await Simulation.find().sort({ createdAt: -1 });
  res.json({ success: true, data: sims });
});

module.exports = router;
