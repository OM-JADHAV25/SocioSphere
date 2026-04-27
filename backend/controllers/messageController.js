const Message = require('../models/Message');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).sort('-createdAt');

    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== req.user._id.toString()) userIds.add(msg.receiver.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('username avatar');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessagesWithUser = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    await message.deleteOne();
    res.json({ message: 'Message removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearConversation = async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    });
    res.json({ message: 'Conversation cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversations, getMessagesWithUser, deleteMessage, clearConversation };
