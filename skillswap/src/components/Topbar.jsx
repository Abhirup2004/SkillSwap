import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import NotificationBell from '../components/NotificationBell';

const Topbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [avatar, setAvatar] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const { isDarkMode, toggleTheme } = useTheme();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || 'User');

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.avatar) {
          setAvatar(`${import.meta.env.VITE_API_URL}/uploads/avatars/${res.data.avatar}`);
        }
      } catch (err) {
        console.error('Topbar fetch error:', err);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-16 bg-white text-black dark:bg-gray-900 dark:text-white shadow px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <Link
        to="/"
        className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 hover:text-sky-500"
      >
        SkillSwap
      </Link>

      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        <NotificationBell />

        <span className="text-gray-800 dark:text-gray-300 hidden sm:inline transition-colors duration-300">
          👋 Hello, {username}
        </span>

        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="focus:outline-none">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border-2 border-sky-500"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center font-semibold text-white">
              {username[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-12 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 transition-all duration-300">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setDropdownOpen(false)}
            >
              <FiGrid className="mr-2" /> Dashboard
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-yellow-600 dark:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
            >
              {isDarkMode ? <FiSun className="mr-2" /> : <FiMoon className="mr-2" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600 transition text-left"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
