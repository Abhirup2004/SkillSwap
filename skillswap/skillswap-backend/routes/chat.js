import express from 'express';
import Message from '../models/Message.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 🔐 JWT middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// ✅ Get all messages between current user and another user
router.get('/messages/:otherUserId', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const otherUserId = req.params.otherUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// ✅ Save new message and emit via socket.io
router.post('/send', verifyToken, async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await newMessage.save();

    await newMessage.populate('sender', 'username avatar');
    await newMessage.populate('receiver', 'username avatar');

    // ✅ Emit from backend (replaces frontend emit)
    const io = req.app.get('io');
    if (io) {
      io.to(senderId).emit('receiveMessage', newMessage);
      io.to(receiverId).emit('receiveMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('❌ Error sending message:', err.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;
