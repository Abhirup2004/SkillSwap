// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-surface text-white px-6 py-4 shadow-md flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary">SkillSwap</Link>
      <div className="space-x-4">
        <Link to="/login" className="hover:text-primary">Login</Link>
        <Link to="/signup" className="hover:text-primary">Signup</Link>
        <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
      </div>
    </nav>
  );
}
