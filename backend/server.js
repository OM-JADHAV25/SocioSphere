const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Routes Space
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SocioSphere Server is healthy.' });
});

// Socket.io for Real-time P2P Routing
const userSocketMap = {}; // Maps userId -> socketId
app.set('io', io);
app.set('userSocketMap', userSocketMap);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  socket.on('send_message', async (msgData) => {
     try {
       const Message = require('./models/Message');
       const newMsg = await Message.create({
         sender: msgData.senderId,
         receiver: msgData.receiverId,
         content: msgData.text
       });
       
       const receiverSocketId = userSocketMap[msgData.receiverId];
       if (receiverSocketId) {
         io.to(receiverSocketId).emit('receive_message', newMsg);
       }
       // Emit back to sender to confirm sync
       socket.emit('receive_message', newMsg);
       
       // Create Notification for the message
       const Notification = require('./models/Notification');
       const User = require('./models/User');
       const senderUser = await User.findById(msgData.senderId).select('username avatar');
       const notif = await Notification.create({
         recipient: msgData.receiverId,
         sender: msgData.senderId,
         type: 'message'
       });
       notif.sender = senderUser; // Populate sender for emission
       if (receiverSocketId) {
         io.to(receiverSocketId).emit('receive_notification', notif);
       }
     } catch (error) {
       console.error("Socket msg error:", error);
     }
  });

  socket.on('send_notification', (noticeData) => {
      const receiverSocketId = userSocketMap[noticeData.recipient];
      if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_notification', noticeData);
      }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let id in userSocketMap) {
      if (userSocketMap[id] === socket.id) {
        delete userSocketMap[id];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

// Database Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connection established');
      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
} else {
  console.warn('\n⚠️  WARNING: MONGO_URI not found in .env\n⚠️  Starting server WITHOUT database connection.\n');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
