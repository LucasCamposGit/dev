// /app/components/Note.jsx
'use client';

import { useState, useEffect } from 'react';
import ReplyBox from './ReplyBox';

export default function Note({ note, onNoteUpdate }) {
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showReplies) {
      fetchReplies();
    }
  }, [showReplies]);

  async function fetchReplies() {
    if (!note?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${note.id}/replies`);
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id) {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      onNoteUpdate();
      return await response.json();
    } catch (error) {
      console.error('Error deleting note:', error);
      return null;
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m`;
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}h`;
      } else if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)}d`;
      } else {
        const options = { month: 'short', day: 'numeric' };
        if (date.getFullYear() !== now.getFullYear()) {
          options.year = 'numeric';
        }
        return date.toLocaleDateString(undefined, options);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const toggleReplyBox = () => {
    setShowReplyBox(!showReplyBox);
  };

  const handleReplySubmit = async () => {
    await fetchReplies();
    if (!showReplies) {
      setShowReplies(true);
    }
  };

  // If note is undefined or null, don't render anything
  if (!note) {
    return null;
  }

  return (
    <div className="note-card p-4 my-2 rounded-none first:rounded-t-xl last:rounded-b-xl">
      <div className="flex">
        <div className="avatar mr-3 flex-shrink-0">
          <i className="fas fa-user"></i>
        </div>
        <div className="flex-grow">
          <div className="flex items-center">
            <span className="font-bold mr-1">User</span>
            <span className="text-gray-500 text-sm mr-1">@user</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-gray-500 text-sm">{formatDate(note.created_at)}</span>
            <button
              onClick={() => deleteNote(note.id)}
              className="ml-auto text-gray-500 hover:text-red-500 focus:outline-none"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          </div>

          <p className="text-white mt-1 mb-2">{note.text}</p>

          <div className="flex justify-between items-center max-w-xs action-icons text-sm">
            <div 
              className="flex items-center group cursor-pointer" 
              onClick={toggleReplyBox}
            >
              <i className="far fa-comment mr-2 group-hover:text-blue-400"></i>
              {replies.length > 0 && (
                <span className="group-hover:text-blue-400">{replies.length}</span>
              )}
            </div>
          </div>

          {replies.length > 0 && (
            <button
              onClick={toggleReplies}
              className="text-sm text-gray-500 hover:text-blue-400 mt-2 flex items-center"
            >
              <span className="mr-1">
                {showReplies 
                  ? `Hide ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
                  : `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
                }
              </span>
              <i className={`fas fa-chevron-${showReplies ? 'up' : 'down'}`}></i>
            </button>
          )}

          {showReplyBox && (
            <ReplyBox 
              parentId={note.id} 
              onReplySubmit={handleReplySubmit} 
              onCancel={toggleReplyBox}
            />
          )}
        </div>
      </div>

      {showReplies && (
        <div className={`replies-container transition-all mt-2 ml-12 pl-3 ${loading ? 'opacity-50' : ''}`}>
          {loading ? (
            <div className="flex justify-center p-2">
              <div className="text-blue-400">
                <i className="fas fa-circle-notch fa-spin"></i>
              </div>
            </div>
          ) : replies.length > 0 ? (
            replies.map((reply) => (
              <div key={reply.id} className="mt-3 pb-3 border-b border-gray-800 relative">
                <div className="flex">
                  <div className="avatar mr-3 flex-shrink-0 w-8 h-8 text-xs">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="font-bold mr-1 text-sm">User</span>
                      <span className="text-gray-500 text-xs mr-1">@user</span>
                      <span className="text-gray-500 mx-1 text-xs">·</span>
                      <span className="text-gray-500 text-xs">{formatDate(reply.created_at)}</span>
                      <button
                        onClick={() => deleteNote(reply.id)}
                        className="ml-auto text-gray-500 hover:text-red-500 focus:outline-none"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                    <p className="text-white text-sm mt-1">{reply.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 p-2 text-sm">
              <p>No replies yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}