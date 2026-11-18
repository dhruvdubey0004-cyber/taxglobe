const express = require('express');
const Treaty = require('../models/treaty');
const Simulation = require('../models/simulation');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/treaties - dropdown ke liye (Public)
router.get('/treaties', async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from) filter.from_country = from;
  if (to) filter.to_country = to;
  const list = await Treaty.find(filter);
  res.json(list);
});

// POST /api/v1/tax/calculate (Public calculator)
router.post('/v1/tax/calculate', async (req, res) => {
  try {
    let { from, to, income_type, gross_income } = req.body;

    // Normalize UAE/AE
    if (from === 'AE') from = 'UAE';
    if (to === 'AE') to = 'UAE';

    const treaty = await Treaty.findOne({
      from_country: from,
      to_country: to,
      income_type: income_type
    });

    if (!treaty) {
      return res.status(404).json({ message: `Treaty not found for this corridor (${from} → ${to}, ${income_type})` });
    }

    const domestic_tax = (gross_income * treaty.domestic_rate) / 100;
    const treaty_tax   = (gross_income * treaty.wht_rate) / 100;
    const savings      = domestic_tax - treaty_tax;

    const output = {
      gross_income,
      domestic_tax,
      treaty_tax,
      tax_liability:    treaty_tax,
      savings,
      treaty_article:   treaty.article_no,
      wht_rate:         treaty.wht_rate,
      domestic_rate:    treaty.domestic_rate,
      source_reference: treaty.source_reference
    };

    // Save history only if logged in
    if (req.user) {
      await Simulation.create({ userId: req.user.id, inputs: req.body, output });
    }

    res.json(output);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/v1/tax/history
router.get('/v1/tax/history', auth, async (req, res) => {
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
