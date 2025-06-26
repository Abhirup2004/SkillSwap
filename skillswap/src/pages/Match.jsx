// src/pages/Match.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Match() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.post(
          'http://localhost:5000/api/user/match',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMatches(res.data.matches);
      } catch (err) {
        console.error('Match fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const sendRequest = async (receiverId, username) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/match/send/${receiverId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusMsg(`✅ Match request sent to ${username}`);
    } catch (err) {
      setStatusMsg('❌ Match request already sent');
    }
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-sky-400 mb-4">🤝 Find Skill Matches</h2>
      {loading ? <p>Loading...</p> : matches.length === 0 ? (
        <p className="text-gray-400">No matching users found.</p>
      ) : matches.map((user) => (
        <div key={user._id} className="bg-gray-900 p-4 mb-4 rounded-lg shadow border border-gray-700">
          <div className="flex items-center gap-4">
            <img
              src={`http://localhost:5000/uploads/avatars/${user.avatar || 'default.png'}`}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-grow">
              <h4 className="text-lg font-bold">{user.username}</h4>
              <p className="text-sm text-gray-400">{user.bio}</p>
              <button
                onClick={() => sendRequest(user._id, user.username)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                ➕ Send Match Request
              </button>
            </div>
          </div>
        </div>
      ))}
      {statusMsg && <div className="mt-4 text-sky-300 font-medium text-center">{statusMsg}</div>}
    </div>
  );
}
