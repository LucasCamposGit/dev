'use client';

import { useState } from 'react';

export default function ReplyBox({ parentId, onReplySubmit, onCancel }) {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const maxCharCount = 280;

  const getCharCountClass = (length) => {
    if (length > 260 && length <= maxCharCount) {
      return 'text-yellow-500';
    } else if (length > maxCharCount) {
      return 'text-red-500';
    }
    return 'text-gray-400';
  };

  const handleSubmit = async () => {
    if (!replyText.trim() || replyText.length > maxCharCount) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: replyText, parent_id: parentId })
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
      
      setReplyText('');
      if (onReplySubmit) {
        onReplySubmit();
      }
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reply-input-container mt-3 flex">
      <div className="avatar mr-3 flex-shrink-0 w-8 h-8 text-xs">
        <i className="fas fa-user"></i>
      </div>
      <div className="flex-grow">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="w-full p-2 rounded-lg resize-none border border-gray-700 bg-transparent note-input-area focus:outline-none text-white text-sm"
          rows="2"
          placeholder="Tweet your reply"
        />
        <div className="flex justify-between items-center mt-2">
          <div className={`text-xs ${getCharCountClass(replyText.length)}`}>
            {replyText.length} / {maxCharCount}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="py-1 px-3 rounded-full text-sm text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!replyText.trim() || replyText.length > maxCharCount || submitting}
              className="btn-tweet py-1 px-3 rounded-full text-sm disabled:opacity-50"
            >
              {submitting ? <i className="fas fa-circle-notch fa-spin"></i> : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}