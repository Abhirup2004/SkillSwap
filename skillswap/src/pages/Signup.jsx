import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        formData
      );
      toast.success('🎉 Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md w-full bg-gray-900 shadow-lg rounded-lg p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6">🚀 Create Your SkillSwap Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            required
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 bg-gray-800 border border-gray-600 rounded"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 bg-gray-800 border border-gray-600 rounded"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-2 bg-gray-800 border border-gray-600 rounded"
          />
          <button
            type="submit"
            className="w-full py-2 bg-sky-600 hover:bg-sky-700 rounded text-white font-semibold"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-sky-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
