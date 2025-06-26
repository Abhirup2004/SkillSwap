import { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const skillOptions = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'java', label: 'Java' },
  { value: 'c++', label: 'C++' },
  { value: 'machine learning', label: 'Machine Learning' },
  { value: 'ai', label: 'AI' },
];

export default function Profile() {
  const [formData, setFormData] = useState({ username: '', bio: '' });
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { username, bio, avatar, skillsToTeach, skillsToLearn } = res.data;
        setFormData({ username: username || '', bio: bio || '' });
        setSkillsToTeach(skillsToTeach || []);
        setSkillsToLearn(skillsToLearn || []);

        if (avatar) {
          setAvatarPreview(`${API}/uploads/avatars/${avatar}`);
        }
      } catch (err) {
        console.error('❌ Profile load failed:', err);
        setMessage({ text: '❌ Failed to load profile.', type: 'error' });
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const data = new FormData();
    data.append('username', formData.username);
    data.append('bio', formData.bio);
    data.append('skillsToTeach', JSON.stringify(skillsToTeach));
    data.append('skillsToLearn', JSON.stringify(skillsToLearn));
    if (avatar) data.append('avatar', avatar);

    try {
      const res = await axios.put(`${API}/api/user/update`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const { username, avatar: newAvatar } = res.data;
      setFormData((prev) => ({ ...prev, username }));
      setMessage({ text: '✅ Profile updated successfully!', type: 'success' });

      if (newAvatar) {
        setAvatarPreview(`${API}/uploads/avatars/${newAvatar}`);
      }
    } catch (err) {
      console.error('❌ Update failed:', err);
      const msg = err.response?.data?.message || '❌ Failed to update profile.';
      setMessage({ text: msg, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-sky-900 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-sky-400">Edit Your Profile</h2>

        {message.text && (
          <div
            className={`mb-6 text-center text-md font-medium ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {avatarPreview && (
            <div className="flex justify-center">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-sky-500 object-cover"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 font-medium">Change Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full text-white file:rounded-lg file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-sky-600"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black border border-sky-400 rounded-lg focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 bg-black border border-sky-400 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Skills to Teach</label>
            <Select
              options={skillOptions}
              isMulti
              className="text-black"
              value={skillOptions.filter((opt) => skillsToTeach.includes(opt.value))}
              onChange={(selected) => setSkillsToTeach(selected.map((s) => s.value))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Skills to Learn</label>
            <Select
              options={skillOptions}
              isMulti
              className="text-black"
              value={skillOptions.filter((opt) => skillsToLearn.includes(opt.value))}
              onChange={(selected) => setSkillsToLearn(selected.map((s) => s.value))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 transition duration-300 text-white font-bold px-6 py-2 rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
