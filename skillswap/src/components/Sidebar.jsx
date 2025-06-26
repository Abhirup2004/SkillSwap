// src/components/Sidebar.jsx
import {
  FaTachometerAlt,
  FaUser,
  FaCog,
  FaHandshake,
  FaInbox,
  FaHistory,
  FaTrophy, // ✅ Trophy Icon Added
} from 'react-icons/fa';
import { TbVideoPlus } from 'react-icons/tb';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [hasRequests, setHasRequests] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-400 font-semibold border-l-4 border-blue-400 pl-2'
      : 'hover:text-blue-300';

  useEffect(() => {
    const checkSessionRequests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/match/session-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.requests && data.requests.length > 0) {
          setHasRequests(true);
        }
      } catch (err) {
        console.error('Failed to fetch session requests:', err);
      }
    };

    checkSessionRequests();
  }, []);

  return (
    <div className="bg-[#1f2937] h-screen w-64 text-white fixed left-0 top-0 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-sky-400 mb-4">SkillSwap</h1>
      <nav className="flex flex-col gap-5">
        <Link to="/dashboard" className={`flex items-center gap-3 ${isActive('/dashboard')}`}>
          <FaTachometerAlt /> Dashboard
        </Link>
        <Link to="/dashboard/profile" className={`flex items-center gap-3 ${isActive('/dashboard/profile')}`}>
          <FaUser /> Profile
        </Link>
        <Link to="/dashboard/match" className={`flex items-center gap-3 ${isActive('/dashboard/match')}`}>
          <FaHandshake /> Matchmaking
        </Link>
        <Link to="/dashboard/requests" className={`flex items-center gap-3 ${isActive('/dashboard/requests')}`}>
          <FaInbox /> Match Requests
        </Link>
        <Link to="/dashboard/match-history" className={`flex items-center gap-3 ${isActive('/dashboard/match-history')}`}>
          <FaHistory /> Match History
        </Link>
        <Link to="/dashboard/session-requests" className={`relative flex items-center gap-3 ${isActive('/dashboard/session-requests')}`}>
          <TbVideoPlus /> Session Requests
          {hasRequests && (
            <span className="absolute top-1 left-48 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          )}
        </Link>
        <Link to="/dashboard/settings" className={`flex items-center gap-3 ${isActive('/dashboard/settings')}`}>
          <FaCog /> Settings
        </Link>

        {/* ✅ Trophy Room Link */}
        <Link to="/dashboard/trophies" className={`flex items-center gap-3 ${isActive('/dashboard/trophies')}`}>
          <FaTrophy /> Trophy Room
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
