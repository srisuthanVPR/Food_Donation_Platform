const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  query: { type: String, required: true },
  response: { type: String, required: true },
  queryType: {
    type: String,
    enum: ['urgent', 'expired', 'wastage', 'top_donor', 'top_receiver', 'trend', 'priority', 'summary', 'available', 'general'],
    default: 'general'
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dataSnapshot: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('AIAnalysisLog', aiLogSchema);
