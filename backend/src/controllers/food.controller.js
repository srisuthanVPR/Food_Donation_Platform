const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createListing = async (req, res) => {
  try {
    const listing = new FoodListing({ ...req.body, donor: req.user._id });
    listing.calculateUrgency();
    await listing.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDonations: 1 } });
    const receivers = await User.find({ role: 'receiver', isActive: true });
    const notifications = receivers.map(r => ({
      recipient: r._id,
      type: listing.isUrgent ? 'urgent_food' : 'new_listing',
      title: listing.isUrgent ? '🚨 Urgent Food Available!' : '🍱 New Food Listing',
      message: `${listing.foodName} (${listing.mealsCount} meals) available at ${listing.pickupAddress}`,
      foodListing: listing._id,
      priority: listing.isUrgent ? 'high' : 'medium'
    }));
    await Notification.insertMany(notifications);
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllListings = async (req, res) => {
  try {
    const { status, foodType, category, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (foodType) filter.foodType = foodType;
    if (category) filter.category = category;
    if (search) filter.foodName = { $regex: search, $options: 'i' };
    const listings = await FoodListing.find(filter)
      .populate('donor', 'name organization phone')
      .populate('claimedBy', 'name organization')
      .sort({ urgencyScore: -1, createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({ donor: req.user._id })
      .populate('claimedBy', 'name organization')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('donor', 'name organization phone address')
      .populate('claimedBy', 'name organization phone');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await FoodListing.findOne({ _id: req.params.id, donor: req.user._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
    if (['claimed', 'picked_up', 'completed'].includes(listing.status))
      return res.status(400).json({ message: 'Cannot edit a claimed or completed listing' });
    Object.assign(listing, req.body);
    listing.calculateUrgency();
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await FoodListing.findOne({ _id: req.params.id, donor: req.user._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
    if (['claimed', 'picked_up'].includes(listing.status))
      return res.status(400).json({ message: 'Cannot delete an active claimed listing' });
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markExpiredListings = async () => {
  try {
    const result = await FoodListing.updateMany(
      { status: 'available', expiryTime: { $lt: new Date() } },
      { status: 'expired' }
    );
    return result.modifiedCount;
  } catch (err) {
    console.error('Error marking expired listings:', err);
  }
};

setInterval(markExpiredListings, 60000);

module.exports = { createListing, getAllListings, getMyListings, getListingById, updateListing, deleteListing };
