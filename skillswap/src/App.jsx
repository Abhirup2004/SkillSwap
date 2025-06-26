import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProfileEdit from "./pages/ProfileEdit";
import Match from "./pages/Match"; // 🧠 Matchmaking Page
import MatchRequestPanel from "./pages/MatchRequestPanel"; // 📥📤 Match Request Panel
import MatchHistory from "./pages/MatchHistory"; // ✅ Added MatchHistory
import PrivateRoute from "./routes/PrivateRoute";
import SessionRoom from './pages/SessionRoom';
import SessionRequests from './pages/SessionRequests';
import TrophyRoom from "./pages/TrophyRoom"; // 🏆 Import Trophy Room
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      {/* ✅ Moved Toaster outside of <Routes> */}
      <Toaster position="top-right" />

      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔒 Protected Dashboard Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="match" element={<Match />} /> {/* ✅ Skill Matchmaking */}
            <Route path="requests" element={<MatchRequestPanel />} /> {/* ✅ Match Requests */}
            <Route path="match-history" element={<MatchHistory />} /> {/* ✅ Match History */}
            <Route path="session/:roomId" element={<SessionRoom />} />
            <Route path="session-requests" element={<SessionRequests />} />
            <Route path="trophies" element={<TrophyRoom />} /> {/* 🏆 Trophy Room */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
