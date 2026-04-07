const router = require('express').Router();
const { getOverallStats, getTopDonors, getTopReceivers, getDailyTrend, getCategoryStats, getDemoReports, getImpactPassport } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/stats', protect, getOverallStats);
router.get('/top-donors', protect, getTopDonors);
router.get('/top-receivers', protect, getTopReceivers);
router.get('/trend', protect, getDailyTrend);
router.get('/categories', protect, getCategoryStats);
router.get('/reports', protect, authorize('admin'), getDemoReports);
router.get('/impact-passport', protect, getImpactPassport);

module.exports = router;
