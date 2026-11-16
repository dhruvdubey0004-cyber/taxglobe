const mongoose = require('mongoose');

const treatySchema = new mongoose.Schema({
  from_country: { type: String, required: true }, // IN
  to_country: { type: String, required: true },   // US
  income_type: { type: String, required: true }, // Royalty / Dividend / Interest / Service
  article_no: { type: String },
  wht_rate: { type: Number, required: true }, // Treaty WHT %
  domestic_rate: { type: Number, required: true }, // India Domestic %
  source_reference: { type: String }
});

module.exports = mongoose.model('treaty', treatySchema);
