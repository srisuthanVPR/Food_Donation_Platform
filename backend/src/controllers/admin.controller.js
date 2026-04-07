const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllListingsAdmin = async (req, res) => {
  try {
    const listings = await FoodListing.find()
      .populate('donor', 'name organization')
      .populate('claimedBy', 'name organization')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteListingAdmin = async (req, res) => {
  try {
    await FoodListing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, toggleUserStatus, getAllListingsAdmin, deleteListingAdmin };
