const User = require('../models/User');

// @desc    Follow or Unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
const toggleFollowUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
      await currentUser.save();
      await targetUser.save();
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      await currentUser.save();
      await targetUser.save();
      
      // Create Notification
      const Notification = require('../models/Notification');
      const notif = await Notification.create({
         recipient: targetUser._id,
         sender: currentUser._id,
         type: 'follow'
      });
      notif.sender = currentUser; // Populate for emission
      const io = req.app.get('io');
      const userSocketMap = req.app.get('userSocketMap');
      if (io && userSocketMap && userSocketMap[targetUser._id.toString()]) {
         io.to(userSocketMap[targetUser._id.toString()]).emit('receive_notification', notif);
      }
    }

    res.json({ following: currentUser.following });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile by ID or Username
// @route   GET /api/users/:identifier
// @access  Public/Private
const getUserProfile = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let user;
    
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(identifier).select('-password');
    } else {
        user = await User.findOne({ username: identifier }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { bio, username, location, website } = req.body;

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    
    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggested
// @access  Private
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users not currently followed by the current user, excluding themselves
    const users = await User.aggregate([
      { 
        $match: { 
          _id: { $ne: currentUser._id, $nin: currentUser.following } 
        } 
      },
      { $sample: { size: 5 } }, // Get up to 5 random users
      { $project: { password: 0 } } // Exclude password
    ]);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by username
// @route   GET /api/users/search?q=
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    }).select('-password').limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleFollowUser, getUserProfile, updateProfile, getSuggestedUsers, searchUsers };
