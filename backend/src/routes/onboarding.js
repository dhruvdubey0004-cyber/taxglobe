const express = require('express');
const router = express.Router();
const Onboarding = require('../models/onboarding');
const auth = require('../middleware/auth');

// POST /api/onboarding - Form save hoga (user-scoped)
router.post('/onboarding', auth, async (req, res) => {
  try {
    const { name, businessType, country, monthlyBilling } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const saved = await new Onboarding({
      name,
      businessType,
      country,
      monthlyBilling,
      userId: req.user ? req.user.id : null
    }).save();

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/onboarding - Only current user's onboarding leads (or all if Admin)
router.get('/onboarding', auth, async (req, res) => {
  try {
    if (!req.user) {
      // Logged out / guest users cannot view private user leads
      return res.json({ success: true, count: 0, data: [] });
    }

    let filter = { userId: req.user.id };
    if (req.user.role === 'Admin') {
      filter = {}; // Admin can see all leads
    }

    const all = await Onboarding.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: all.length, data: all });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/onboarding/:id - Delete a specific lead
router.delete('/onboarding/:id', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let filter = { _id: req.params.id, userId: req.user.id };
    if (req.user.role === 'Admin') {
      filter = { _id: req.params.id };
    }

    const deleted = await Onboarding.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found or permission denied' });
    }

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;