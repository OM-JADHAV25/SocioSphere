const express = require('express');
const router = express.Router();
const { toggleFollowUser, getUserProfile, updateProfile, getSuggestedUsers, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.put('/profile', protect, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Upload error details:', err);
      return res.status(400).json({ message: `Image upload failed: ${err.message}` });
    }
    next();
  });
}, updateProfile);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/search', protect, searchUsers);
router.put('/:id/follow', protect, toggleFollowUser);
router.get('/:identifier', getUserProfile);

module.exports = router;
