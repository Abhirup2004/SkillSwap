// src/pages/ProfileEdit.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const [formData, setFormData] = useState({ username: '', bio: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    axios
      .get('http://localhost:5000/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { username, bio, avatar } = res.data;
        setFormData({ username, bio });
        if (avatar) {
          setAvatarPreview(`http://localhost:5000/uploads/avatars/${avatar}`);
        }
      })
      .catch((err) => console.error('Failed to load profile:', err));
  }, []);

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
    const data = new FormData();
    data.append('username', formData.username);
    data.append('bio', formData.bio);
    if (avatar) data.append('avatar', avatar);

    try {
      await axios.put('http://localhost:5000/api/user/update', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('✅ Profile updated!');
      navigate('/profile');
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('❌ Error updating profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-sky-900 text-white p-6">
      <div className="max-w-xl mx-auto bg-gray-900 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-sky-400">Edit Profile</h2>

        {message && <div className="text-center text-green-400 mb-4">{message}</div>}

        {avatarPreview && (
          <div className="flex justify-center mb-4">
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full border-2 border-sky-500 object-cover"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Change Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-white file:bg-sky-500 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 bg-black border border-sky-400 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 bg-black border border-sky-400 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 transition text-white font-bold py-2 px-4 rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
