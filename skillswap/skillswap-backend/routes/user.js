import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { awardXp } from '../utils/levelSystem.js';

const router = express.Router();

// 🔒 JWT Middleware
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

// 📦 Multer Setup for Avatar Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ GET /api/user/me — Fetch user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      xp: user.xp || 0,
      level: user.level || 1,
      badges: user.badges || [],
      skillsToTeach: user.skillsToTeach || [],
      skillsToLearn: user.skillsToLearn || [],
      recentSessions: user.recentSessions || [],
    });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔁 PUT /api/user/update — Update profile + avatar
router.put('/update', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { username, bio, skillsToTeach, skillsToLearn } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (bio) user.bio = bio;

    if (skillsToTeach) {
      try {
        user.skillsToTeach = JSON.parse(skillsToTeach);
      } catch (err) {
        console.warn('Invalid skillsToTeach JSON');
      }
    }

    if (skillsToLearn) {
      try {
        user.skillsToLearn = JSON.parse(skillsToLearn);
      } catch (err) {
        console.warn('Invalid skillsToLearn JSON');
      }
    }

    if (req.file) {
      if (user.avatar && fs.existsSync(`uploads/avatars/${user.avatar}`)) {
        fs.unlinkSync(`uploads/avatars/${user.avatar}`);
      }
      user.avatar = req.file.filename;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      skillsToTeach: user.skillsToTeach,
      skillsToLearn: user.skillsToLearn,
    });
  } catch (err) {
    console.error('PUT /update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔍 POST /api/user/match — Skill Matchmaking
router.post('/match', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const matches = await User.find({
      _id: { $ne: user._id },
      skillsToTeach: { $in: user.skillsToLearn },
      skillsToLearn: { $in: user.skillsToTeach },
    }).select('-password');

    res.json({ matches });
  } catch (err) {
    console.error('POST /match error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🤝 POST /api/user/send-request — Send Match Request
router.post('/send-request', verifyToken, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  if (!receiverId) return res.status(400).json({ message: 'Receiver ID required' });
  if (receiverId === senderId) return res.status(400).json({ message: 'Cannot send to yourself' });

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ message: 'Sender not found' });

    if (!receiver.incomingRequests) receiver.incomingRequests = [];

    const alreadyRequested = receiver.incomingRequests.some(
      (req) => req.from.toString() === senderId
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: 'You already sent a request to this user' });
    }

    receiver.incomingRequests.push({ from: senderId, date: new Date().toISOString() });
    await receiver.save();

    res.json({ message: 'Request sent successfully', username: receiver.username });
  } catch (err) {
    console.error('Send request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST /api/user/session-complete — Called after video ends
router.post('/session-complete', verifyToken, async (req, res) => {
  const { title, type } = req.body;
  const xpGain = 50;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.xp += xpGain;
    awardXp(user, 50);

    user.recentSessions.unshift({
      title,
      type,
      date: new Date().toLocaleString(),
    });
    user.recentSessions = user.recentSessions.slice(0, 10);

    await user.save();

    res.json({
      message: 'Session completed, XP awarded',
      newXP: user.xp,
      level: user.level,
      badges: user.badges,
      recentSessions: user.recentSessions,
    });
  } catch (err) {
    console.error('Session complete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🚀 ✅ POST /api/user/interests — Update user interests
router.post('/interests', verifyToken, async (req, res) => {
  const { interests } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.interests = interests;
    await user.save();

    res.json({ message: 'Interests updated', interests });
  } catch (err) {
    console.error('Update interests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📊 ✅ GET /api/user/suggestions — Get ML skill recommendations
router.get('/suggestions', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('suggestedSkills');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ suggestions: user.suggestedSkills || [] });
  } catch (err) {
    console.error('Get suggestions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🏆 GET /api/user/leaderboard — Top 10 by XP
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ xp: -1, level: -1, updatedAt: -1 })
      .limit(10)
      .select('username xp level avatar');

    res.json({ leaderboard: topUsers });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
