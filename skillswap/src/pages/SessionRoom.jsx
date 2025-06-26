import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SessionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    // ✅ Load Jitsi script dynamically
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      launchJitsi();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const launchJitsi = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomId,
      width: '100%',
      height: 700,
      parentNode: jitsiContainerRef.current,
      interfaceConfigOverwrite: {
        filmStripOnly: false,
        SHOW_JITSI_WATERMARK: false,
      },
      configOverwrite: {
        prejoinPageEnabled: false,
      },
      userInfo: {
        displayName: 'SkillSwap User',
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    // ✅ Handle meeting end (close tab or leave)
    api.addEventListener('readyToClose', async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_URL}/user/session-complete`, {
          title: 'SkillSwap Video Session',
          type: 'Taught',
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error('Error marking session complete:', err);
      } finally {
        navigate('/dashboard/match-history');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <h1 className="text-3xl font-bold text-sky-400 mb-6 text-center">🎥 SkillSwap Session</h1>
      <div ref={jitsiContainerRef} className="w-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
};

export default SessionRoom;
