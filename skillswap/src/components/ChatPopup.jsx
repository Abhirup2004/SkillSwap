// src/components/ChatPopup.jsx
import { useState } from 'react';
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ChatPanel from '../pages/ChatPanel';

export default function ChatPopup({ selectedUser }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="bg-gray-900 rounded-2xl shadow-lg animate-slide-in-up">
          <div className="flex justify-end p-2">
            <button onClick={() => setOpen(false)} className="text-white hover:text-red-400">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-2">
            <ChatPanel selectedUser={selectedUser} />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
