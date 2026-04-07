const Claim = require('../models/Claim');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const User = require('../models/User');

const claimFood = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.status !== 'available') return res.status(400).json({ message: 'Food is no longer available' });
    if (listing.expiryTime < new Date()) return res.status(400).json({ message: 'Food has expired' });

    listing.status = 'claimed';
    listing.claimedBy = req.user._id;
    listing.claimedAt = new Date();
    listing.calculateUrgency();
    await listing.save();

    const claim = await Claim.create({
      foodListing: listing._id,
      claimedBy: req.user._id,
      donor: listing.donor,
      notes: req.body.notes
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalClaims: 1 } });

    await Notification.create({
      recipient: listing.donor,
      type: 'food_claimed',
      title: '✅ Your food has been claimed!',
      message: `${req.user.name} (${req.user.organization || 'Volunteer'}) claimed your ${listing.foodName}`,
      foodListing: listing._id,
      priority: 'high'
    });

    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate({ path: 'foodListing', populate: { path: 'donor', select: 'name organization phone' } })
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDonorClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ donor: req.user._id })
      .populate({ path: 'foodListing', populate: { path: 'claimedBy', select: 'name organization phone' } })
      .populate('claimedBy', 'name organization phone')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const isOwner = claim.claimedBy.toString() === req.user._id.toString();
    const isDonor = claim.donor.toString() === req.user._id.toString();
    if (!isOwner && !isDonor && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    claim.status = status;
    if (status === 'picked_up') claim.pickedUpAt = new Date();
    if (status === 'completed') claim.completedAt = new Date();
    await claim.save();

    await FoodListing.findByIdAndUpdate(claim.foodListing, { status });

    if (status === 'picked_up') {
      await Notification.create({
        recipient: claim.donor,
        type: 'pickup_confirmed',
        title: '🚗 Food Picked Up!',
        message: `Your food donation has been picked up successfully.`,
        foodListing: claim.foodListing,
        priority: 'medium'
      });
    }

    if (status === 'completed') {
      await Notification.create({
        recipient: claim.donor,
        type: 'pickup_confirmed',
        title: '✅ Donation Completed!',
        message: `Your food donation has been successfully delivered to those in need.`,
        foodListing: claim.foodListing,
        priority: 'medium'
      });
    }

    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('foodListing', 'foodName mealsCount status')
      .populate('claimedBy', 'name organization')
      .populate('donor', 'name organization')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { claimFood, getMyClaims, getDonorClaims, updateClaimStatus, getAllClaims };
