import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function SessionRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/match/session-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch session requests:', err);
      toast.error('❌ Failed to fetch session requests');
    }
  };

  const joinSession = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/api/match/session-request/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('✅ Session request cleared');
      fetchRequests(); // Refresh the list after removal

      navigate(`/dashboard/session/${roomId}`);
    } catch (err) {
      console.error('Failed to clear session request:', err);
      toast.error('❌ Failed to clear session request');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6 text-sky-400">📺 Session Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400">No session requests yet.</p>
      ) : (
        requests.map((req, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg p-4 mb-4 shadow border border-gray-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:5000/uploads/avatars/${req.avatar || 'default.png'}`}
                alt={req.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-lg font-bold">{req.username}</h4>
                <p className="text-sm text-gray-400">{req.bio || 'No bio provided'}</p>
                <p className="text-xs text-gray-500">Sent on: {new Date(req.date).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => joinSession(req.roomId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🎥 Join Session
            </button>
          </div>
        ))
      )}
    </div>
  );
}
