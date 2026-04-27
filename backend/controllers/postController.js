const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post must contain text or an image' });
    }

    const post = await Post.create({
      user: req.user._id,
      text: text || '',
      image: imageUrl,
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Feed (Posts from users you follow + your own)
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followingIds = user.following;
    followingIds.push(req.user._id); // Include user's own posts

    const posts = await Post.find({ user: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate({
         path: 'comments',
         populate: { path: 'user', select: 'username avatar' }
      });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      
      if (post.user.toString() !== req.user._id.toString()) {
         const Notification = require('../models/Notification');
         const User = require('../models/User');
         const notif = await Notification.create({
            recipient: post.user,
            sender: req.user._id,
            type: 'like',
            post: post._id
         });
         const currentUser = await User.findById(req.user._id).select('username avatar');
         notif.sender = currentUser;
         const io = req.app.get('io');
         const userSocketMap = req.app.get('userSocketMap');
         if (io && userSocketMap && userSocketMap[post.user.toString()]) {
            io.to(userSocketMap[post.user.toString()]).emit('receive_notification', notif);
         }
      }
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts (Explore Grid)
// @route   GET /api/posts
// @access  Private
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate({
         path: 'comments',
         populate: { path: 'user', select: 'username avatar' }
      });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text
    });

    post.comments.push(comment._id);
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
       const Notification = require('../models/Notification');
       const User = require('../models/User');
       const notif = await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'comment',
          post: post._id
       });
       const currentUser = await User.findById(req.user._id).select('username avatar');
       notif.sender = currentUser;
       const io = req.app.get('io');
       const userSocketMap = req.app.get('userSocketMap');
       if (io && userSocketMap && userSocketMap[post.user.toString()]) {
          io.to(userSocketMap[post.user.toString()]).emit('receive_notification', notif);
       }
    }

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username avatar');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'username avatar')
      .sort('createdAt');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get posts by user identifier
// @route   GET /api/posts/user/:identifier
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(identifier);
    } else {
        user = await User.findOne({ username: identifier });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate({
         path: 'comments',
         populate: { path: 'user', select: 'username avatar' }
      });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate({
         path: 'comments',
         populate: { path: 'user', select: 'username avatar' }
      });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get liked posts by user identifier
// @route   GET /api/posts/liked/:identifier
// @access  Private
const getLikedPosts = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(identifier);
    } else {
        user = await User.findOne({ username: identifier });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ likes: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate({
         path: 'comments',
         populate: { path: 'user', select: 'username avatar' }
      });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post (owner only)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only the post owner can delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Cascade: delete all comments tied to this post
    await Comment.deleteMany({ post: post._id });

    // Cascade: delete all notifications referencing this post
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ post: post._id });

    // Delete the post itself
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post deleted successfully', postId: post._id });
  } catch (error) {
    console.error('Delete post error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getFeed, toggleLikePost, getAllPosts, addComment, getComments, getUserPosts, getPostById, getLikedPosts, deletePost };
