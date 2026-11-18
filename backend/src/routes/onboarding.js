const express = require('express');
const router = express.Router();
const Onboarding = require('../models/onboarding');

// POST /api/onboarding - Form save hoga
router.post('/onboarding', async (req, res) => {
  try {
    const { name, businessType, country, monthlyBilling } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const saved = await new Onboarding({
      name,
      businessType,
      country,
      monthlyBilling
    }).save();

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/onboarding - Sir ko saare leads dikhane ke liye
router.get('/onboarding', async (req, res) => {
  try {
    const all = await Onboarding.find().sort({ createdAt: -1 });
    res.json({ success: true, count: all.length, data: all });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;