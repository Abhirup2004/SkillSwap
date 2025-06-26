import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import matchRequestRoutes from './routes/matchRequest.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ✅ Real-time messaging via socket
io.on('connection', (socket) => {
  console.log('🔌 A user connected');

  // Join personal room
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  // ✅ Real-time Message Handler (from DB → emit)
  socket.on('sendMessage', async ({ from, to, content }) => {
    try {
      const newMessage = new Message({ sender: from, receiver: to, content });
      await newMessage.save();

      await newMessage.populate('sender', 'username avatar');
      await newMessage.populate('receiver', 'username avatar');

      io.to(from).emit('receiveMessage', newMessage);
      io.to(to).emit('receiveMessage', newMessage);

      console.log(`💬 ${from} → ${to}: ${content}`);
    } catch (err) {
      console.error('❌ Socket message error:', err.message);
    }
  });

  // 👀 Typing Indicator Handler
  socket.on('typing', ({ to, from }) => {
    io.to(to).emit('userTyping', { from });
  });

  // ✅ NEW: Mark messages as "read" when recipient opens chat
  socket.on('messageSeen', async ({ from, to }) => {
    try {
      const updated = await Message.updateMany(
        { sender: from, receiver: to, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );

      console.log(`👁️‍🗨️ Messages from ${from} to ${to} marked as read.`);

      // Notify sender to update message status
      io.to(from).emit('messagesRead', { by: to });
    } catch (err) {
      console.error('❌ Message seen error:', err.message);
    }
  });
});

// ✅ Make io available in routes
app.set('io', io);

// ✅ Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/match', matchRequestRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
