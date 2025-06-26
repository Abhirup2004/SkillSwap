// src/pages/Home.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Home() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Parallax Glow */}
        <motion.div
          className="pointer-events-none absolute top-0 left-0 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl z-0"
          animate={{
            x: mouseX - 192,
            y: mouseY - 192,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Welcome to SkillSwap</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-6 max-w-2xl">
  Peer-to-peer learning made <span className="bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-400 bg-clip-text text-transparent animate-shimmer font-semibold">premium</span>. Connect, teach, and grow through microlearning sessions.
</p>


          <Link to="/signup" className="z-10 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl text-lg font-semibold transition">
            Get Started
          </Link>
        </div>

        {/* Gradient Wave Background */}
        <div className="absolute bottom-0 left-0 w-[200%] h-40 z-0 wave-bg blur-2xl opacity-60 rounded-t-full" />
      </div>

      {/* Features Section */}
      <div className="bg-surface py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Why Choose SkillSwap?</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-background p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2 text-primary">🔄 Skill Matchmaking</h3>
            <p className="text-gray-400">Instantly find peers to teach or learn new skills based on your interests.</p>
          </div>
          <div className="bg-background p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2 text-primary">🎥 Micro-Sessions</h3>
            <p className="text-gray-400">Join or host short, focused, real-time video sessions to maximize learning.</p>
          </div>
          <div className="bg-background p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2 text-primary">🏆 Gamified Growth</h3>
            <p className="text-gray-400">Earn XP, level up, and unlock badges as you teach and learn.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-background py-20 px-6 border-t border-surface">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-2xl shadow-xl w-full md:w-1/3">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-primary mb-2">1. Teach</h3>
            <p className="text-gray-400">Share what you know with curious learners around the world. Host a quick session on anything you're good at.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-2xl shadow-xl w-full md:w-1/3">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-primary mb-2">2. Learn</h3>
            <p className="text-gray-400">Pick up new skills from real people in real time. Learn from bite-sized live sessions that fit your schedule.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-2xl shadow-xl w-full md:w-1/3">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-primary mb-2">3. Grow</h3>
            <p className="text-gray-400">Track your growth, earn XP, and build a profile that shines — whether you're a mentor or a student.</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-surface py-20 px-6 border-t border-background">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">What Our Users Say</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-background/60 backdrop-blur-md p-6 rounded-2xl shadow-lg text-white border border-surface">
            <p className="italic mb-4 text-gray-300">"SkillSwap helped me level up my web development skills in just weeks. Loved the micro-sessions!"</p>
            <h3 className="text-lg font-semibold text-primary">Aarav Sinha</h3>
            <p className="text-sm text-gray-400">Frontend Developer, India</p>
          </div>
          <div className="bg-background/60 backdrop-blur-md p-6 rounded-2xl shadow-lg text-white border border-surface">
            <p className="italic mb-4 text-gray-300">"Teaching others boosted my confidence and resume. It's a win-win platform!"</p>
            <h3 className="text-lg font-semibold text-primary">Meera Roy</h3>
            <p className="text-sm text-gray-400">AI Enthusiast, Bangalore</p>
          </div>
          <div className="bg-background/60 backdrop-blur-md p-6 rounded-2xl shadow-lg text-white border border-surface">
            <p className="italic mb-4 text-gray-300">"The gamified learning system is addictive. I earn badges while learning design!"</p>
            <h3 className="text-lg font-semibold text-primary">Rahul Verma</h3>
            <p className="text-sm text-gray-400">UI/UX Designer, Delhi</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
