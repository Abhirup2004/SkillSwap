// src/layouts/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-all duration-300">
      {/* 📚 Sidebar Navigation */}
      <Sidebar />

      {/* 🧱 Main Content Layout */}
      <div className="flex flex-col flex-1 ml-64">
        {/* 🔝 Topbar includes NotificationBell inside it */}
        <Topbar />

        {/* 📄 Routed Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
