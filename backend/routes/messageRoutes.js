const express = require('express');
const router = express.Router();
const { getConversations, getMessagesWithUser, deleteMessage, clearConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessagesWithUser);
router.delete('/conversation/:userId', protect, clearConversation);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
