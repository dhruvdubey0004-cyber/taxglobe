const express = require('express');
const Treaty = require('../models/treaty');
const Simulation = require('../models/simulation');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/calculate
router.post('/calculate', auth, async (req, res) => {
  try {
    let { from_country, to_country, income_type, amount } = req.body;

    // Normalize UAE/AE
    if (from_country === 'AE') from_country = 'UAE';
    if (to_country === 'AE') to_country = 'UAE';

    const treaty = await Treaty.findOne({ from_country, to_country, income_type });
    if (!treaty) {
      return res.status(404).json({ message: `Treaty not found for ${from_country} → ${to_country} (${income_type})` });
    }

    const domesticTax = (amount * treaty.domestic_rate) / 100;
    const treatyTax   = (amount * treaty.wht_rate) / 100;
    const savings     = domesticTax - treatyTax;
    const netAmount   = amount - treatyTax;

    const output = {
      amount,
      domestic_rate:    treaty.domestic_rate,
      wht_rate:         treaty.wht_rate,
      domesticTax,
      treatyTax,
      savings,
      netAmount,
      article_no:       treaty.article_no,
      source_reference: treaty.source_reference
    };

    if (req.user) {
      await Simulation.create({ userId: req.user.id, inputs: req.body, output });
    }

    res.json(output);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/history
router.get('/history', auth, async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const list = await Simulation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
