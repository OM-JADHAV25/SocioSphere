const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, clearNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);
router.delete('/clear', protect, clearNotifications);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
