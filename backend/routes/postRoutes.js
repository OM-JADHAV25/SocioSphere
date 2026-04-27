const express = require('express');
const router = express.Router();
const { createPost, getFeed, toggleLikePost, getAllPosts, addComment, getComments, getUserPosts, getPostById, getLikedPosts, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.get('/', protect, getAllPosts);
router.post('/', protect, upload.single('image'), createPost);
router.get('/feed', protect, getFeed);
router.get('/user/:identifier', protect, getUserPosts);
router.get('/liked/:identifier', protect, getLikedPosts);
router.get('/:id', protect, getPostById);
router.put('/:id/like', protect, toggleLikePost);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);
router.delete('/:id', protect, deletePost);

module.exports = router;
