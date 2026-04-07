const router = require('express').Router();
const { getAllUsers, toggleUserStatus, getAllListingsAdmin, deleteListingAdmin } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);
router.get('/listings', protect, authorize('admin'), getAllListingsAdmin);
router.delete('/listings/:id', protect, authorize('admin'), deleteListingAdmin);

module.exports = router;
