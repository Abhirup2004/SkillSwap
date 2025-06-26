// src/pages/MatchRequestPanel.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MatchRequestPanel() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/match/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Fetch requests error:', err);
    }
  };

  const respondToRequest = async (senderId, action) => {
    try {
      await axios.post(
        'http://localhost:5000/api/match/respond',
        { senderId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); // Refresh
    } catch (err) {
      console.error('Respond error:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h2 className="text-3xl font-bold text-sky-400 mb-4">📥 Match Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400">No incoming match requests yet.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className="bg-gray-900 p-4 mb-4 rounded-lg shadow border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:5000/uploads/avatars/${req.avatar || 'default.png'}`}
                alt={req.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-lg font-bold">{req.username}</h4>
                <p className="text-sm text-gray-400">{req.bio}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => respondToRequest(req._id, 'accepted')} className="bg-green-600 px-3 py-1 rounded hover:bg-green-700">
                ✅ Accept
              </button>
              <button onClick={() => respondToRequest(req._id, 'rejected')} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
