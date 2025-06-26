// src/components/Leaderboard.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/leaderboard`);
        setLeaders(res.data.leaderboard);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-xl text-white">
      <h2 className="text-2xl font-semibold mb-4 text-sky-400">🏆 Leaderboard</h2>
      {leaders.length === 0 ? (
        <p className="text-gray-400">No users on the leaderboard yet.</p>
      ) : (
        <ul className="space-y-4">
          {leaders.map((user, idx) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-3 bg-black rounded-xl border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-sky-400 w-6">{idx + 1}.</span>
                <img
                  src={
                    user.avatar
                      ? `${API_URL}/uploads/avatars/${user.avatar}`
                      : '/default-avatar.png'
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border border-sky-500"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-gray-400 text-sm">Level {user.level}</p>
                </div>
              </div>
              <span className="text-sky-300 font-bold">{user.xp} XP</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
