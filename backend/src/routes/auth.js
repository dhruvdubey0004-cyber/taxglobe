const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const OTP = require('../models/otp');
const auth = require('../middleware/auth');
const router = express.Router();

// REGISTER (requires OTP verified)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, otpCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email & password are required' });
    }
    if (!otpCode) {
      return res.status(400).json({ message: 'Please verify your email with OTP first' });
    }

    // Verify OTP one final time before creating account
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp: otpCode });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please resend and verify again.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'User', emailVerified: true });

    // Clean up OTP
    await OTP.deleteMany({ email: email.toLowerCase() });

    res.status(201).json({ message: 'Account created & email verified! Please log in.', userId: user._id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET CURRENT USER (/api/auth/me)
router.get('/me', auth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
