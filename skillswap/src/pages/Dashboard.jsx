import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import ChatPanel from './ChatPanel';
import SkillSuggestions from '../components/SkillSuggestions';
import Leaderboard from '../components/Leaderboard'; // ✅ NEW import
import { MessageCircleIcon, X } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState({
    username: 'User',
    xp: 0,
    level: 1,
    badges: [],
  });

  const [recentSessions, setRecentSessions] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard | SkillSwap';

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);

        const profileRes = await axios.get('http://localhost:5000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = profileRes.data;

        setUser({
          username: profileData.username || 'User',
          xp: profileData.xp || 0,
          level: profileData.level || 1,
          badges: profileData.badges || [],
        });

        setRecentSessions(profileData.recentSessions || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchUserData();
  }, []);

  const progressToNextLevel = user.xp % 100;
  const xpRemaining = 100 - progressToNextLevel;

  return (
    <div className="min-h-screen bg-blue text-blue relative">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user.username} 👋
        </h1>

        {/* XP & Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg text-center">
            <h2 className="text-4xl font-bold text-sky-400">{user.xp}</h2>
            <p className="text-gray-400 mt-2">Total XP</p>
            <div className="mt-4">
              <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progressToNextLevel}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{xpRemaining} XP to level up</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg text-center">
            <h2 className="text-4xl font-bold text-sky-400">Lv. {user.level}</h2>
            <p className="text-gray-400 mt-2">Current Level</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg text-center">
            <h2 className="text-lg font-bold text-sky-400 mb-2">🏅 Badges</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {user.badges.length > 0 ? (
                user.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-black text-sm px-3 py-1 rounded-full border border-sky-400 text-sky-400"
                  >
                    {badge}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No badges yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Recent Sessions</h2>
          <div className="space-y-4">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-black px-4 py-3 rounded-xl border border-gray-800"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-sky-400">
                      {session.title || 'SkillSwap Session'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {session.type === 'Taught' ? 'You taught' : 'You learned'} · {session.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.type === 'Taught'
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {session.type}
                    </span>
                    {session.partnerId && session.partnerName && (
                      <button
                        onClick={() => {
                          setSelectedChatUser({
                            _id: session.partnerId,
                            username: session.partnerName,
                          });
                          setIsChatOpen(true);
                        }}
                        className="bg-sky-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-sky-700"
                      >
                        Message
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No recent sessions found.</p>
            )}
          </div>
        </div>

        {/* ✅ ML Skill Suggestions */}
        <SkillSuggestions />

        {/* 🏆 Leaderboard */}
        <Leaderboard />
      </div>

      {/* Floating Chat Panel */}
      {selectedChatUser && isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className="relative">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow"
              title="Close Chat"
            >
              <X size={16} />
            </button>
            <ChatPanel selectedUser={selectedChatUser} />
          </div>
        </div>
      )}

      {/* Floating Chat Icon */}
      {selectedChatUser && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-full shadow-lg transition"
          title="Open Chat"
        >
          <MessageCircleIcon />
        </button>
      )}
    </div>
  );
}
