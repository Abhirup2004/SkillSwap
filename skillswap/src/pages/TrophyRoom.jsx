import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TrophyRoom = () => {
  const [badges, setBadges] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);

        const res = await axios.get('http://localhost:5000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsername(res.data.username);
        setBadges(res.data.badges || []);
      } catch (err) {
        console.error('Error fetching badges:', err);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-sky-400 mb-10">
          🏆 {username}'s Trophy Room
        </h1>

        {badges.length === 0 ? (
          <div className="text-center mt-20 text-gray-400">
            <p className="text-lg mb-4">No badges yet...</p>
            <p className="text-sm">
              Start hosting or attending sessions to unlock your first trophy!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-tr from-yellow-400 to-yellow-500 text-black p-6 rounded-xl shadow-lg hover:shadow-yellow-300/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center text-5xl mb-4 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.5)]">
                  <FaTrophy />
                </div>
                <h2 className="text-center font-semibold text-lg">{badge}</h2>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrophyRoom;
