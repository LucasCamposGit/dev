// app/page.js
'use client'; // This page requires client-side interactivity

import React, { useState, useEffect, useCallback } from 'react';
import NoteInput from './components/NoteInput';
import NoteCard from './components/NoteCard';

export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial notes
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (e) {
      console.error("Failed to fetch notes:", e);
      setError('Could not load notes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notes on initial mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Handler for posting a new note (passed to NoteInput)
  const handlePostNote = async (text) => {
    setError(null);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }), // parent_id is null for top-level notes
      });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const newNote = await response.json();
      // Add new note to the top of the list
      setNotes(prevNotes => [newNote, ...prevNotes]);
    } catch (e) {
      console.error("Failed to post note:", e);
      setError(`Failed to post note: ${e.message}`);
      throw e; // Re-throw to indicate failure to the input component
    }
  };

  // Handler for posting a reply (passed down to NoteCard)
  const handlePostReply = async (text, parentId) => {
     setError(null);
     try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, parent_id: parentId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const newReplyData = await response.json();

        // Update the reply count on the parent note in the state
        setNotes(prevNotes => prevNotes.map(note =>
            note.id === parentId
            ? { ...note, reply_count: (note.reply_count || 0) + 1 } // Increment count
            : note
        ));

        return newReplyData; // Return the new reply data to NoteCard

     } catch (e) {
        console.error("Failed to post reply:", e);
        setError(`Failed to post reply: ${e.message}`);
        throw e; // Re-throw
     }
  };


  // Handler for deleting a note or reply (passed down)
  const handleDeleteNote = async (id) => {
      setError(null);
      try {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        // Remove the deleted note/reply from the state
        // This works for both top-level notes and replies within NoteCard's state
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
        // Note: If a reply is deleted via this function called from ReplyCard,
        // the parent NoteCard's reply count also needs updating.
        // This might be better handled within NoteCard itself after successful deletion.
         console.log(`Note/Reply ${id} deleted`);

      } catch (e) {
          console.error("Failed to delete note:", e);
          setError(`Failed to delete note: ${e.message}`);
          throw e; // Re-throw
      }
  };


  return (
    <div>
      <NoteInput onPost={handlePostNote} />

      {error && <div className="text-red-500 text-center p-4 bg-red-900/20 rounded-lg mb-4">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="twitter-blue">
            <i className="fas fa-circle-notch fa-spin fa-2x"></i>
          </div>
        </div>
      ) : (
        <div className="note-list space-y-0"> {/* Wrapper for rounded corners */}
          {notes.length === 0 && !error ? (
             <div className="text-center text-gray-500 p-4 note-card rounded-xl"> {/* Added card style */}
                <p>No notes yet. Start the conversation!</p>
             </div>
          ) : (
            notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onReply={handlePostReply}
                onDelete={handleDeleteNote}
                // We don't pass initialReplies here; NoteCard fetches them on demand
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}


// Utility function (consider moving to lib/utils.js)
/*
// lib/utils.js
export function formatDate(dateString) {
    // ... (implementation from original app.js)
     const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else if (diffInSeconds < 604800) { // A week
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } else {
      const options = { month: 'short', day: 'numeric' };
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
      }
      return date.toLocaleDateString(undefined, options);
    }
}
*/
