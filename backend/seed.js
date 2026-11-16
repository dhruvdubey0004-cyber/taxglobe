const mongoose = require('mongoose');
require('dotenv').config();
const Treaty = require('./src/models/treaty');

const data = [
  // IN -> US
  { from_country: 'IN', to_country: 'US', income_type: 'Royalty',      article_no: 'Art. 12', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-US DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'US', income_type: 'FTS',          article_no: 'Art. 12', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-US DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'US', income_type: 'Dividends',    article_no: 'Art. 10', wht_rate: 15, domestic_rate: 20, source_reference: 'IN-US DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'US', income_type: 'Interest',     article_no: 'Art. 11', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-US DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'US', income_type: 'CapitalGains', article_no: 'Art. 13', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-US DTAA', status: 'Active' },

  // IN -> SG
  { from_country: 'IN', to_country: 'SG', income_type: 'Royalty',      article_no: 'Art. 12', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-SG DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'SG', income_type: 'FTS',          article_no: 'Art. 12', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-SG DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'SG', income_type: 'Dividends',    article_no: 'Art. 10', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-SG DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'SG', income_type: 'Interest',     article_no: 'Art. 11', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-SG DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'SG', income_type: 'CapitalGains', article_no: 'Art. 13', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-SG DTAA', status: 'Active' },

  // IN -> UAE
  { from_country: 'IN', to_country: 'UAE', income_type: 'Royalty',      article_no: 'Art. 12', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-UAE DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UAE', income_type: 'FTS',          article_no: 'Art. 12', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-UAE DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UAE', income_type: 'Dividends',    article_no: 'Art. 10', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-UAE DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UAE', income_type: 'Interest',     article_no: 'Art. 11', wht_rate:  5, domestic_rate: 20, source_reference: 'IN-UAE DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UAE', income_type: 'CapitalGains', article_no: 'Art. 13', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-UAE DTAA', status: 'Active' },

  // IN -> UK
  { from_country: 'IN', to_country: 'UK', income_type: 'Royalty',      article_no: 'Art. 13', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-UK DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UK', income_type: 'FTS',          article_no: 'Art. 13', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-UK DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UK', income_type: 'Dividends',    article_no: 'Art. 10', wht_rate: 15, domestic_rate: 20, source_reference: 'IN-UK DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UK', income_type: 'Interest',     article_no: 'Art. 11', wht_rate: 10, domestic_rate: 20, source_reference: 'IN-UK DTAA', status: 'Active' },
  { from_country: 'IN', to_country: 'UK', income_type: 'CapitalGains', article_no: 'Art. 13', wht_rate:  0, domestic_rate: 20, source_reference: 'IN-UK DTAA', status: 'Active' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Treaty.deleteMany({});
  const inserted = await Treaty.insertMany(data);
  console.log(`✅ Seed Done - ${inserted.length} treaties inserted`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
