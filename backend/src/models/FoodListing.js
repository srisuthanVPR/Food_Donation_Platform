const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['cooked', 'packed', 'raw', 'beverages', 'bakery', 'other'],
    required: true
  },
  quantity: { type: Number, required: true },
  mealsCount: { type: Number, required: true },
  foodType: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan'], required: true },
  preparationTime: { type: Date, required: true },
  expiryTime: { type: Date, required: true },
  pickupAddress: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  specialNotes: { type: String },
  status: {
    type: String,
    enum: ['available', 'claimed', 'picked_up', 'expired', 'completed'],
    default: 'available'
  },
  urgencyScore: { type: Number, default: 0 },
  isUrgent: { type: Boolean, default: false },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  claimedAt: { type: Date, default: null }
}, { timestamps: true });

foodListingSchema.methods.calculateUrgency = function () {
  const now = new Date();
  const timeLeft = (this.expiryTime - now) / (1000 * 60);
  let score = 0;
  if (timeLeft <= 30) score += 50;
  else if (timeLeft <= 60) score += 35;
  else if (timeLeft <= 120) score += 20;
  else if (timeLeft <= 240) score += 10;
  if (this.mealsCount >= 50) score += 20;
  else if (this.mealsCount >= 20) score += 10;
  else if (this.mealsCount >= 10) score += 5;
  if (this.category === 'cooked') score += 10;
  if (this.status === 'available') score += 15;
  this.urgencyScore = Math.min(score, 100);
  this.isUrgent = timeLeft <= 60;
  return this.urgencyScore;
};

module.exports = mongoose.model('FoodListing', foodListingSchema);
