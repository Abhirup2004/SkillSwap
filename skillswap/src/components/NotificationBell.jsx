// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, setNotifications } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Handle click outside to auto-close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative focus:outline-none"
      >
        <BellIcon className="h-6 w-6 text-gray-700 dark:text-white" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {notifications.length}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-72 overflow-y-auto bg-white dark:bg-gray-900 shadow-xl rounded-xl p-4 z-50 border border-gray-200 dark:border-gray-700 animate-slide-in-up">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
              🔔 Notifications
            </h4>
            <button
              onClick={clearNotifications}
              className="text-xs text-sky-500 hover:underline"
            >
              Clear All
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No new notifications
            </p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((note, index) => (
                <li
                  key={index}
                  className="text-sm bg-sky-100/70 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 rounded-lg shadow-sm"
                >
                  {note.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
