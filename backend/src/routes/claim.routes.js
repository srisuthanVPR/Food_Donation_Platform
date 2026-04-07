const router = require('express').Router();
const { claimFood, getMyClaims, getDonorClaims, updateClaimStatus, getAllClaims } = require('../controllers/claim.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/my', protect, authorize('receiver'), getMyClaims);
router.get('/donor', protect, authorize('donor', 'admin'), getDonorClaims);
router.get('/all', protect, authorize('admin'), getAllClaims);
router.post('/:id/claim', protect, authorize('receiver', 'admin'), claimFood);
router.put('/:id/status', protect, updateClaimStatus);

module.exports = router;
