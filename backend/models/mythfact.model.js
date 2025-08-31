const mongoose = require('mongoose');

const MythFactSchema = new mongoose.Schema({
  type: { type: String, enum: ['myth', 'fact'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['general', 'prevention', 'treatment', 'diet'], default: 'general' },
}, { timestamps: true });

module.exports = mongoose.model('MythFact', MythFactSchema);
