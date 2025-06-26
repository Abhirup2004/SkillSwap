import { useEffect, useState } from 'react';
import axios from 'axios';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function SkillSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/user/suggestions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error('❌ Error fetching suggestions:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="bg-gradient-to-br from-sky-800/60 to-sky-950/80 backdrop-blur p-6 rounded-xl shadow-lg border border-sky-600/30">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-6 w-6 text-yellow-300 animate-pulse" />
        <h2 className="text-lg font-semibold text-white">✨ Skill Recommendations</h2>
      </div>

      {loading ? (
        <p className="text-sky-300 text-sm">Loading recommendations...</p>
      ) : suggestions.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No suggestions available yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {suggestions.map((skill, idx) => (
            <li
              key={idx}
              className="bg-sky-700/70 hover:bg-sky-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-150 shadow-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
