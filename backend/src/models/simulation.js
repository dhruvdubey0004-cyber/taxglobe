const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inputs: { type: Object },
  output: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('simulation', simulationSchema);