const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['claimed', 'picked_up', 'completed', 'cancelled'],
    default: 'claimed'
  },
  claimedAt: { type: Date, default: Date.now },
  pickedUpAt: { type: Date },
  completedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
