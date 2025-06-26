// src/pages/SessionRoom.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Jutsu } from 'react-jutsu';
import axios from 'axios';

const SessionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [jitsiReady, setJitsiReady] = useState(false);
  const [roomReady, setRoomReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setJitsiReady(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    if (jitsiReady) {
      const timer = setTimeout(() => setRoomReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [jitsiReady]);

  // ✅ Trigger XP Award + Redirect on Meeting End
  const handleMeetingEnd = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/user/session-complete',
        {
          title: 'SkillSwap Video Session',
          type: 'Taught', // you can later make this dynamic based on role
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error('Error sending session completion:', err);
    } finally {
      navigate('/dashboard/match-history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center px-4">
      <h2 className="text-4xl font-bold text-sky-400 mb-6">🎥 SkillSwap Session</h2>
      {!jitsiReady ? (
        <p className="text-lg animate-pulse text-gray-300">Loading video engine...</p>
      ) : roomReady ? (
        <div className="jitsi-container w-full max-w-[1600px] h-[80vh] rounded-lg overflow-hidden shadow-2xl border border-sky-700">
          <Jutsu
            roomName={roomId}
            displayName="SkillSwap User"
            loadingComponent={<p className="text-center mt-10 text-gray-400">🔄 Connecting to session...</p>}
            onMeetingEnd={handleMeetingEnd} // ✅ Call XP API
            containerStyles={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <p className="text-lg text-gray-300">Preparing session...</p>
      )}
    </div>
  );
};

export default SessionRoom;
