import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { PaperPlaneIcon, FaceIcon } from '@radix-ui/react-icons';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const socket = io('http://localhost:5000', { withCredentials: true });

export default function ChatPanel({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.id);
    socket.emit('joinRoom', decoded.id);
  }, []);

  useEffect(() => {
    if (!selectedUser?._id || !currentUserId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/messages/${selectedUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);

        // ✅ Mark all received messages as delivered
        res.data.forEach((msg) => {
          if (
            msg.receiver._id === currentUserId &&
            msg.status !== 'delivered'
          ) {
            socket.emit('messageDelivered', { messageId: msg._id });
          }
        });

        // ✅ Emit "seen" if current user is viewing this chat
        socket.emit('messageSeen', {
          from: selectedUser._id,
          to: currentUserId,
        });
      } catch (err) {
        console.error('❌ Fetch failed:', err);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, currentUserId]);

  useEffect(() => {
    const handleReceive = (msg) => {
      const isRelevant =
        msg.sender._id === selectedUser._id ||
        msg.receiver._id === selectedUser._id;

      if (isRelevant) {
        setMessages((prev) => [...prev, msg]);

        // ✅ Emit delivery confirmation if I am the receiver
        if (msg.receiver._id === currentUserId && msg.status !== 'delivered') {
          socket.emit('messageDelivered', { messageId: msg._id });
        }
      }
    };

    const handleStatusUpdate = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('messageStatusUpdated', handleStatusUpdate);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('messageStatusUpdated', handleStatusUpdate);
    };
  }, [selectedUser?._id, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(
        'http://localhost:5000/api/chat/send',
        {
          receiverId: selectedUser._id,
          content: input,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setInput('');
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('❌ Error sending message:', err.message);
    }
  };

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji.native);
  };

  return (
    <div className="w-full max-w-lg bg-gradient-to-br from-[#0f172a]/70 to-[#1e293b]/80 backdrop-blur border border-sky-500/30 shadow-xl rounded-2xl p-4 text-white flex flex-col h-[500px] overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-3 border-b border-sky-500/20 pb-2">
        <img
          src={`http://localhost:5000/uploads/avatars/${selectedUser.avatar || 'default.png'}`}
          alt={selectedUser.username}
          className="w-10 h-10 rounded-full object-cover border border-sky-400 shadow-sm"
        />
        <div>
          <h2 className="text-lg font-semibold">{selectedUser.username}</h2>
          <p className="text-xs text-gray-400">You're connected</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar transition-all">
        {messages.map((msg, idx) => (
          <div key={msg._id || idx}>
            <div
              className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow-sm transition-all duration-300 ease-in-out ${
                msg.sender._id === currentUserId
                  ? 'ml-auto bg-sky-600 text-white rounded-br-none animate-bounce-in-right'
                  : 'mr-auto bg-gray-700 text-white rounded-bl-none animate-bounce-in-left'
              }`}
            >
              {msg.content}
            </div>
            {/* ✅ Read receipt indicator */}
            {msg.sender._id === currentUserId && (
              <div className="text-[10px] text-right pr-2 text-sky-300 italic">
                {msg.status === 'read'
                  ? '✓✓ Seen'
                  : msg.status === 'delivered'
                  ? '✔ Delivered'
                  : '✓ Sent'}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-4 z-50">
          <Picker data={data} onEmojiSelect={addEmoji} theme="dark" />
        </div>
      )}

      {/* Input */}
      <div className="flex mt-4 border-t border-sky-500/20 pt-3 relative">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="px-2 text-xl text-sky-400 hover:text-sky-300"
        >
          <FaceIcon />
        </button>
        <input
          className="flex-1 bg-gray-800/60 text-white px-4 py-2 rounded-l-xl outline-none placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-sky-500/50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-r-xl font-semibold flex items-center gap-1 transition-all duration-200 active:scale-95"
        >
          <PaperPlaneIcon /> Send
        </button>
      </div>
    </div>
  );
}
