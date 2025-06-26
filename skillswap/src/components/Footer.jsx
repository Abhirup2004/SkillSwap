// src/components/Footer.jsx
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-surface text-gray-300 py-10 border-t border-background">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        
        {/* Left Side */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-white mb-1">SkillSwap</h2>
          <p className="text-sm text-gray-400">Peer-to-peer learning made premium.</p>
        </div>

        {/* Center – Socials */}
        <div className="flex space-x-6 text-2xl">
          <a href="https://github.com/Abhirup2004" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
            <FaGithub />
          </a>
          <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
            <FaLinkedin />
          </a>
          <a href="mailto:samadderabhirup2004@gmail.com" className="hover:text-primary transition">
            <FaEnvelope />
          </a>
        </div>

        {/* Right Side */}
        <div className="text-sm text-gray-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
        </div>

      </div>
    </footer>
  )
}
