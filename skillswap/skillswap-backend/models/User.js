// backend/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true },
  password: { type: String, required: true },

  bio:    { type: String, default: '' },
  avatar: { type: String, default: '' },

  skillsToTeach: { type: [String], default: [] },
  skillsToLearn: { type: [String], default: [] },

  xp:     { type: Number, default: 0 },
  level:  { type: Number, default: 1 },
  badges: { type: [String], default: [] },

  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  recentSessions: [
    {
      title: { type: String },
      type: { type: String },
      date: { type: String },
    },
  ],

  // ✅ Enables dashboard session tracking
  sessionHistory: [
    {
      partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['taught', 'learned'],
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // ✅ Match request system
  matchRequestsSent: [
    {
      user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      date:   { type: Date, default: Date.now },
    },
  ],

  matchRequestsReceived: [
    {
      user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      date:   { type: Date, default: Date.now },
    },
  ],

  // ✅ Real-time join requests
  incomingRequests: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      roomId: String,
      date: { type: Date, default: Date.now },
    },
  ],

  // ✅ NEW: ML-Ready Fields
  interests: { type: [String], default: [] },         // e.g. ['React', 'Design Thinking']
  sessionTags: { type: [String], default: [] },       // Automatically filled from attended sessions
  suggestedSkills: { type: [String], default: [] },   // ML-recommended skills

  // ✅ NEW: Optional Leaderboard Rank
  leaderboardRank: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model('User', userSchema);
