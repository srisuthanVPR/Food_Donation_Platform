const router = require('express').Router();
const { getMyNotifications, markAsRead, markAllRead, getUnreadCount } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
