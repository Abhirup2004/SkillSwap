// scripts/seedUsers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

dotenv.config();

const mockUsers = [
  {
    username: 'Alice',
    email: 'alice@mock.com',
    password: '123456',
    skillsToTeach: ['javascript', 'html'],
    skillsToLearn: ['python', 'sql'],
    bio: 'Frontend wizard',
  },
  {
    username: 'Bob',
    email: 'bob@mock.com',
    password: '123456',
    skillsToTeach: ['python', 'sql'],
    skillsToLearn: ['javascript'],
    bio: 'Backend guy',
  },
  {
    username: 'Charlie',
    email: 'charlie@mock.com',
    password: '123456',
    skillsToTeach: ['java', 'c++'],
    skillsToLearn: ['html', 'css'],
    bio: 'Systems engineer',
  },
  {
    username: 'Diana',
    email: 'diana@mock.com',
    password: '123456',
    skillsToTeach: ['html', 'css'],
    skillsToLearn: ['java', 'c++'],
    bio: 'UI Designer',
  },
  {
    username: 'Eve',
    email: 'eve@mock.com',
    password: '123456',
    skillsToTeach: ['machine learning', 'ai'],
    skillsToLearn: ['javascript', 'react'],
    bio: 'AI/ML enthusiast',
  },
  {
    username: 'Frank',
    email: 'frank@mock.com',
    password: '123456',
    skillsToTeach: ['nodejs', 'express'],
    skillsToLearn: ['machine learning', 'ai'],
    bio: 'Full stack guy',
  },
  {
    username: 'Grace',
    email: 'grace@mock.com',
    password: '123456',
    skillsToTeach: ['html', 'css', 'javascript'],
    skillsToLearn: ['nodejs', 'express'],
    bio: 'Frontend intern',
  },
  {
    username: 'Heidi',
    email: 'heidi@mock.com',
    password: '123456',
    skillsToTeach: ['sql', 'mongodb'],
    skillsToLearn: ['react', 'nodejs'],
    bio: 'Database engineer',
  },
  {
    username: 'Ivan',
    email: 'ivan@mock.com',
    password: '123456',
    skillsToTeach: ['react', 'redux'],
    skillsToLearn: ['sql', 'mongodb'],
    bio: 'React developer',
  },
  {
    username: 'Judy',
    email: 'judy@mock.com',
    password: '123456',
    skillsToTeach: ['python', 'data analysis'],
    skillsToLearn: ['javascript', 'html'],
    bio: 'Data analyst',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove previous mock users only
    await User.deleteMany({ email: /@mock\.com$/ });
    console.log('🗑️ Deleted old mock users');

    // Hash passwords
    for (const user of mockUsers) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    // Insert new users
    await User.insertMany(mockUsers);
    console.log('✅ Inserted new mock users successfully!');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();
