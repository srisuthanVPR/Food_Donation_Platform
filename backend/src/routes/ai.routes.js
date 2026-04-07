const router = require('express').Router();
const { askBot, getInsights } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/ask', protect, askBot);
router.get('/insights', protect, getInsights);

module.exports = router;
