const router = require('express').Router();
const { createListing, getAllListings, getMyListings, getListingById, updateListing, deleteListing } = require('../controllers/food.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getAllListings);
router.post('/', protect, authorize('donor', 'admin'), createListing);
router.get('/my', protect, authorize('donor'), getMyListings);
router.get('/:id', protect, getListingById);
router.put('/:id', protect, authorize('donor', 'admin'), updateListing);
router.delete('/:id', protect, authorize('donor', 'admin'), deleteListing);

module.exports = router;
