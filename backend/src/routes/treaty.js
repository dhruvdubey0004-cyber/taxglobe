const express = require('express');
const router = express.Router();
const Treaty = require('../models/treaty');
const auth = require('../middleware/auth');

// Format DB doc -> frontend shape
function formatTreaty(doc) {
  const t = doc.toObject ? doc.toObject() : doc;
  return {
    _id: t._id,
    from: t.from_country,
    to: t.to_country,
    incomeType: t.income_type,
    article: t.article_no || '',
    domesticRate: t.domestic_rate,
    treatyRate: t.wht_rate,
    status: t.status || 'Active',
    legalNote: t.legal_note || ''
  };
}

// GET /api/v1/treaties
router.get('/v1/treaties', auth, async (req, res) => {
  try {
    const { from, to, incomeType } = req.query;
    const filter = {};
    if (from) filter.from_country = from;
    if (to) filter.to_country = to;
    if (incomeType) filter.income_type = incomeType;
    const docs = await Treaty.find(filter);
    res.json(docs.map(formatTreaty));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/v1/treaties
router.post('/v1/treaties', auth, async (req, res) => {
  try {
    const { from, to, incomeType, article, domesticRate, treatyRate, status, legalNote } = req.body;
    const treaty = await Treaty.create({
      from_country: from,
      to_country: to,
      income_type: incomeType,
      article_no: article,
      domestic_rate: Number(domesticRate),
      wht_rate: Number(treatyRate),
      status: status || 'Active',
      legal_note: legalNote || ''
    });
    res.status(201).json(formatTreaty(treaty));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/v1/treaties/:id
router.put('/v1/treaties/:id', auth, async (req, res) => {
  try {
    const { from, to, incomeType, article, domesticRate, treatyRate, status, legalNote } = req.body;
    const mapped = {};
    if (from !== undefined) mapped.from_country = from;
    if (to !== undefined) mapped.to_country = to;
    if (incomeType !== undefined) mapped.income_type = incomeType;
    if (article !== undefined) mapped.article_no = article;
    if (domesticRate !== undefined) mapped.domestic_rate = Number(domesticRate);
    if (treatyRate !== undefined) mapped.wht_rate = Number(treatyRate);
    if (status !== undefined) mapped.status = status;
    if (legalNote !== undefined) mapped.legal_note = legalNote;

    const treaty = await Treaty.findByIdAndUpdate(req.params.id, mapped, { new: true });
    if (!treaty) return res.status(404).json({ message: 'Treaty not found' });
    res.json(formatTreaty(treaty));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /api/v1/treaties/:id
router.delete('/v1/treaties/:id', auth, async (req, res) => {
  try {
    const result = await Treaty.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Treaty not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
