import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import { awardXp } from '../utils/levelSystem.js'; // ✅ XP System

const router = express.Router();

// 🔐 Token Verification Middleware
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

// ✅ 1. Send Match Request
router.post('/send/:receiverId', verifyToken, async (req, res) => {
  try {
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(req.params.receiverId);

    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const alreadySent = receiver.matchRequestsReceived.some(
      (r) => r.user.toString() === sender._id.toString()
    );

    if (alreadySent) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    receiver.matchRequestsReceived.push({
      user: sender._id,
      status: 'pending',
      date: new Date(),
    });

    sender.matchRequestsSent.push({
      user: receiver._id,
      status: 'pending',
      date: new Date(),
    });

    await receiver.save();
    await sender.save();

    res.json({ message: 'Request sent successfully' });
  } catch (err) {
    console.error('Send request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 2. Get Match Requests (Pending)
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'matchRequestsReceived.user',
      'username avatar bio'
    );

    const requests = user.matchRequestsReceived
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        _id: r.user._id,
        username: r.user.username,
        avatar: r.user.avatar,
        bio: r.user.bio,
        date: r.date,
      }));

    res.json({ requests });
  } catch (err) {
    console.error('Fetch requests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 3. Accept or Reject Request with Socket.io Notification
router.post('/respond', verifyToken, async (req, res) => {
  const { senderId, action } = req.body;

  try {
    const receiver = await User.findById(req.user.id);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) return res.status(404).json({ message: 'User not found' });

    receiver.matchRequestsReceived = receiver.matchRequestsReceived.map((r) => {
      if (r.user.toString() === senderId) r.status = action;
      return r;
    });

    sender.matchRequestsSent = sender.matchRequestsSent.map((r) => {
      if (r.user.toString() === receiver._id.toString()) r.status = action;
      return r;
    });

    if (action === 'accepted') {
      if (!receiver.matches.includes(sender._id)) receiver.matches.push(sender._id);
      if (!sender.matches.includes(receiver._id)) sender.matches.push(receiver._id);

      // ✅ Award XP
      awardXp(receiver, 50);
      awardXp(sender, 50);
    }

    await receiver.save();
    await sender.save();

    // ✅ Emit real-time matchAccepted notification via Socket.io
    const io = req.app.get('io');
    if (action === 'accepted' && io) {
      io.to(sender._id.toString()).emit('matchAccepted', {
        message: `${receiver.username} accepted your match request.`,
        from: {
          _id: receiver._id,
          username: receiver.username,
          avatar: receiver.avatar,
        },
        type: 'matchAccepted',
        date: new Date(),
      });
    }

    res.json({ message: `Request ${action}` });
  } catch (err) {
    console.error('Respond error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 4. Match History
router.get('/matches', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'matches',
      'username avatar bio'
    );

    const matches = user.matches.map((match) => {
      const sortedIds = [req.user.id, match._id.toString()].sort().join('-');
      const roomId = crypto.createHash('sha256').update(sortedIds).digest('hex').slice(0, 12);
      return {
        _id: match._id,
        username: match.username,
        avatar: match.avatar,
        bio: match.bio,
        roomId,
      };
    });

    res.json({ matches });
  } catch (err) {
    console.error('Match history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 5. Send Session Request
router.post('/send-session-request', verifyToken, async (req, res) => {
  const { toUserId } = req.body;

  try {
    const senderId = req.user.id;
    const receiver = await User.findById(toUserId);
    const sender = await User.findById(senderId);

    if (!receiver) return res.status(404).json({ message: 'User not found' });

    const sortedIds = [senderId, toUserId].sort().join('-');
    const roomId = crypto.createHash('sha256').update(sortedIds).digest('hex').slice(0, 12);

    const alreadyExists = receiver.incomingRequests.some(
      (req) => req.from.toString() === senderId && req.roomId === roomId
    );

    if (alreadyExists) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    receiver.incomingRequests.push({
      from: senderId,
      roomId,
      date: new Date()
    });

    await receiver.save();

    res.json({ message: 'Session request sent' });
  } catch (err) {
    console.error('Send session request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 6. Get Session Requests
router.get('/session-requests', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'incomingRequests.from',
      'username avatar bio'
    );

    const requests = user.incomingRequests.map((r) => ({
      _id: r.from._id,
      username: r.from.username,
      avatar: r.from.avatar,
      bio: r.from.bio,
      roomId: r.roomId,
      date: r.date,
    }));

    res.json({ requests });
  } catch (err) {
    console.error('Fetching session requests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 7. Clear Session Request
router.delete('/session-request/:roomId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { roomId } = req.params;

    user.incomingRequests = user.incomingRequests.filter(
      (r) => r.roomId !== roomId
    );

    await user.save();
    res.json({ message: 'Session request cleared' });
  } catch (err) {
    console.error('Error clearing session request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/user/session-history — for dashboard
router.get('/session-history', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('sessionHistory.partner', 'username');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const sessions = user.sessionHistory.map((s) => ({
      partnerName: s.partner.username,
      role: s.role,
      date: s.date,
    }));

    res.json({ sessions });
  } catch (err) {
    console.error('Error fetching session history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ 8. End Session — XP + MatchHistory + SessionHistory + RecentSessions
router.post('/end-session/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    // ✅ Award XP
    awardXp(sender, 50);
    awardXp(receiver, 50);

    // ✅ Add to match history if not already present
    if (!sender.matchHistory.includes(receiver._id)) {
      sender.matchHistory.push(receiver._id);
    }

    if (!receiver.matchHistory.includes(sender._id)) {
      receiver.matchHistory.push(sender._id);
    }

    // ✅ Log session in sessionHistory
    const now = new Date();

    sender.sessionHistory.push({
      partner: receiver._id,
      date: now,
      role: 'taught',
    });

    receiver.sessionHistory.push({
      partner: sender._id,
      date: now,
      role: 'learned',
    });

    // ✅ Also update recentSessions (for dashboard)
    sender.recentSessions.unshift({
      title: 'Skill Swap Session',
      type: 'Taught',
      date: now.toLocaleString(),
    });
    sender.recentSessions = sender.recentSessions.slice(0, 10);

    receiver.recentSessions.unshift({
      title: 'Skill Swap Session',
      type: 'Learned',
      date: now.toLocaleString(),
    });
    receiver.recentSessions = receiver.recentSessions.slice(0, 10);

    await sender.save();
    await receiver.save();

    res.json({ message: 'Session ended and recorded for both users' });
  } catch (err) {
    console.error('❌ Error ending session:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
