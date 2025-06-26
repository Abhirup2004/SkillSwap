import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function MatchRequestPanel() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('❌ Fetch requests error:', err);
      toast.error('Failed to load match requests');
    }
  };

  const respondToRequest = async (senderId, action) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/match/respond`,
        { senderId, action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        action === 'accepted'
          ? '✅ Match request accepted!'
          : '❌ Match request rejected.'
      );

      fetchRequests(); // Refresh list after action
    } catch (err) {
      console.error('❌ Respond error:', err);
      toast.error('Failed to respond to match request');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h2 className="text-3xl font-bold text-sky-400 mb-6">📥 Match Requests</h2>

      {requests.length === 0 ? (
        <p className="text-gray-400">No incoming match requests yet.</p>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="bg-gray-900 p-4 mb-4 rounded-lg shadow border border-gray-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/avatars/${req.avatar || 'default.png'}`}
                alt={req.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-lg font-bold">{req.username}</h4>
                <p className="text-sm text-gray-400">
                  {req.bio || 'No bio provided.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => respondToRequest(req._id, 'accepted')}
                className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white font-medium transition"
              >
                ✅ Accept
              </button>
              <button
                onClick={() => respondToRequest(req._id, 'rejected')}
                className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white font-medium transition"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
