const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['urgent_food', 'food_claimed', 'pickup_confirmed', 'food_expired', 'new_listing', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', default: null },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
