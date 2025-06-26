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

// ✅ Setup Socket.io with deployed frontend
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://skill-swap-amber.vercel.app', // ✅ deployed frontend URL
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ✅ Socket.io Events
io.on('connection', (socket) => {
  console.log('🔌 A user connected');

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

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

  socket.on('typing', ({ to, from }) => {
    io.to(to).emit('userTyping', { from });
  });

  socket.on('messageSeen', async ({ from, to }) => {
    try {
      await Message.updateMany(
        { sender: from, receiver: to, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );
      io.to(from).emit('messagesRead', { by: to });
      console.log(`👁️‍🗨️ Messages from ${from} to ${to} marked as read.`);
    } catch (err) {
      console.error('❌ Message seen error:', err.message);
    }
  });
});

// ✅ Attach io to app
app.set('io', io);

// ✅ Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://skill-swap-amber.vercel.app', // ✅ deployed frontend URL
  ],
  credentials: true,
}));
app.options('*', cors()); // ✅ Enable preflight for all routes
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/match', matchRequestRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('SkillSwap API is live');
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
