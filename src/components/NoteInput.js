// app/components/NoteInput.js
'use client'; // This component needs client-side interactivity

import React, { useState } from 'react';

export default function NoteInput({ onPost }) {
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const maxLength = 280;
  const length = text.length;
  const remaining = maxLength - length;

  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const handlePost = async () => {
    if (!text.trim() || length > maxLength || isPosting) return;

    setIsPosting(true);
    try {
      await onPost(text); // Call the passed-in function
      setText(''); // Clear input on success
    } catch (error) {
      console.error("Failed to post note:", error);
      // Optionally show an error message to the user
    } finally {
      setIsPosting(false);
    }
  };

  // Determine character count color
  let countColor = 'text-gray-400';
  if (remaining < 20 && remaining >= 0) {
    countColor = 'text-yellow-500';
  } else if (remaining < 0) {
    countColor = 'text-red-500';
  }

  return (
    <div className="p-4 note-card mb-4 rounded-xl"> {/* Added rounded-xl */}
      <div className="flex">
        <div className="avatar mr-3">
          <i className="fas fa-user"></i>
        </div>
        <div className="flex-grow">
          <textarea
            value={text}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg resize-none border-0 bg-transparent note-input-area focus:outline-none text-white"
            rows="3"
            placeholder="What's your deepest thought?"
            maxLength={maxLength + 10} // Allow slightly over for visual feedback
          />
          <div className="flex justify-between items-center mt-2">
            <div className={`text-sm ${countColor}`}>
              {length} / {maxLength}
            </div>
            <button
              onClick={handlePost}
              className="btn-tweet"
              disabled={!text.trim() || length > maxLength || isPosting}
            >
              {isPosting ? <i className="fas fa-circle-notch fa-spin"></i> : 'Take note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
