// /app/components/NoteApp.jsx
'use client';

import { useState, useEffect } from 'react';
import Note from './Note';

export default function NoteApp() {
  const [tweetText, setTweetText] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const maxCharCount = 280;

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function createNote(text, parentId = null) {
    if (!text || text.trim() === '') return null;
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, parent_id: parentId })
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }
      
      await fetchNotes();
      return await response.json();
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  }

  const getCharCountClass = (length) => {
    if (length > 260 && length <= maxCharCount) {
      return 'text-yellow-500';
    } else if (length > maxCharCount) {
      return 'text-red-500';
    }
    return 'text-gray-400';
  };

  const handlePostNote = async () => {
    if (tweetText.trim() && tweetText.length <= maxCharCount && !isPosting) {
      setIsPosting(true);
      await createNote(tweetText);
      setTweetText('');
      setIsPosting(false);
    }
  };

  return (
    <>
      <div className="p-4 rounded-xl note-card mb-4">
        <div className="flex">
          <div className="avatar mr-3">
            <i className="fas fa-user"></i>
          </div>
          <div className="flex-grow">
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              className="w-full p-2 rounded-lg resize-none border-0 bg-transparent note-input-area focus:outline-none text-white"
              rows="3"
              placeholder="What's your deepest thought?"
            />
            <div className="flex justify-between items-center mt-2">
              <div className={`text-sm ${getCharCountClass(tweetText.length)}`}>
                {tweetText.length} / {maxCharCount}
              </div>
              <button
                onClick={handlePostNote}
                disabled={!tweetText.trim() || tweetText.length > maxCharCount || isPosting}
                className="btn-tweet py-1 px-4 rounded-full disabled:opacity-50"
              >
                {isPosting ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  'Take note'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="text-blue-400">
              <i className="fas fa-circle-notch fa-spin fa-2x"></i>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            <p>No notes yet. Start the conversation!</p>
          </div>
        ) : (
          notes.map((note) => (
            <Note 
              key={note.id} 
              note={note} 
              onNoteUpdate={fetchNotes} 
            />
          ))
        )}
      </div>
    </>
  );
}