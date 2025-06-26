// src/pages/MatchHistory.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import ChatPanel from './ChatPanel'; // ✅ Import ChatPanel

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // ✅ Selected chat user

  const token = localStorage.getItem('token');
  const { socket, user } = useNotification();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/match/matches', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(res.data.matches || []);
      } catch (err) {
        console.error('Error fetching match history:', err);
        toast.error('❌ Failed to fetch match history');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const requestToJoin = async (receiverId, roomId, username) => {
    try {
      await axios.post(
        'http://localhost:5000/api/match/send-session-request',
        { toUserId: receiverId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (socket && user) {
        socket.emit('sendSessionRequest', {
          from: user._id,
          to: receiverId,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
        });
      }

      toast.success(`📩 Session request sent to ${username}`);
    } catch (err) {
      console.error('Send session request error:', err);
      toast.error('❌ Request already sent or failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6 text-sky-400">🤝 Match History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-gray-400">No matches yet.</p>
      ) : (
        matches.map((match) => (
          <div
            key={match._id}
            className="bg-gray-900 rounded-lg p-4 mb-4 shadow border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={`http://localhost:5000/uploads/avatars/${match.avatar || 'default.png'}`}
                  alt={match.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-bold">{match.username}</h4>
                  <p className="text-sm text-gray-400">{match.bio || 'No bio provided.'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/dashboard/session/${match.roomId}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                >
                  🎥 Start Session
                </Link>

                <button
                  onClick={() => requestToJoin(match._id, match.roomId, match.username)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                >
                  📩 Request to Join
                </button>

                <button
                  onClick={() => setSelectedUser(match)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded"
                >
                  💬 Message
                </button>
              </div>
            </div>

            {/* ✅ Render ChatPanel below the match card if selected */}
            {selectedUser && selectedUser._id === match._id && (
              <div className="mt-4">
                <ChatPanel selectedUser={selectedUser} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
