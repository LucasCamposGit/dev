// app/components/NoteCard.js
'use client';

import React, { useState, useEffect } from 'react';
import ReplyCard from './ReplyCard';
import { formatDate } from '@/lib/utils'; // Assuming formatDate is moved to a utils file

export default function NoteCard({ note, onReply, onDelete, initialReplies = [] }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(initialReplies);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(note.reply_count || 0); // Use count from initial fetch

  const maxLength = 280;
  const replyLength = replyText.length;
  const replyRemaining = maxLength - replyLength;

  // Function to fetch replies if not already loaded
  const loadReplies = async () => {
    if (replies.length > 0 || isLoadingReplies) return; // Don't refetch if already loaded or loading

    setIsLoadingReplies(true);
    try {
        const response = await fetch(`/api/notes/${note.id}/replies`);
        if (!response.ok) {
            throw new Error('Failed to fetch replies');
        }
        const fetchedReplies = await response.json();
        setReplies(fetchedReplies);
        setReplyCount(fetchedReplies.length); // Update count based on actual fetch
    } catch (error) {
        console.error("Error fetching replies:", error);
        // Optionally show an error message
    } finally {
        setIsLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    const newState = !showReplies;
    setShowReplies(newState);
    if (newState && replies.length === 0 && replyCount > 0) {
        // Load replies only when opening and if replies haven't been loaded yet but count > 0
        loadReplies();
    }
  };

  const toggleReplyInput = () => {
    setShowReplyInput(!showReplyInput);
  };

  const handleReplyInputChange = (event) => {
    setReplyText(event.target.value);
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || replyLength > maxLength || isPostingReply) return;

    setIsPostingReply(true);
    try {
      const newReplyData = await onReply(replyText, note.id); // Pass text and parent ID
      // Add the new reply optimistically or refetch
      setReplies(prevReplies => [...prevReplies, newReplyData]);
      setReplyCount(prevCount => prevCount + 1); // Increment reply count
      setReplyText(''); // Clear input
      setShowReplyInput(false); // Hide input box
      if (!showReplies) { // If replies weren't open, open them now
          setShowReplies(true);
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
      // Optionally show an error message
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleDeleteSelf = async (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this note and all its replies?')) {
          await onDelete(note.id);
      }
  };

  const handleDeleteReply = async (replyId) => {
      try {
          await onDelete(replyId); // Call the main delete function
          setReplies(prevReplies => prevReplies.filter(r => r.id !== replyId)); // Remove from local state
          setReplyCount(prevCount => prevCount - 1); // Decrement count
      } catch (error) {
          console.error("Failed to delete reply:", error);
          // Optionally show error
      }
  };


  // Determine reply character count color
  let replyCountColor = 'text-gray-400';
  if (replyRemaining < 20 && replyRemaining >= 0) {
    replyCountColor = 'text-yellow-500';
  } else if (replyRemaining < 0) {
    replyCountColor = 'text-red-500';
  }

  return (
    <div className="note-card p-4"> {/* Removed my-2, handled by parent */}
      <div className="flex">
        {/* Avatar */}
        <div className="avatar mr-3">
          <i className="fas fa-user"></i>
        </div>

        {/* Content container */}
        <div className="flex-grow">
          {/* Header */}
          <div className="flex items-center">
            <span className="font-bold mr-1">User</span>
            <span className="text-gray-500 text-sm mr-1">@user</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-gray-500 text-sm">
              {formatDate(note.created_at)}
            </span>
            {/* Delete Button */}
            <button
              onClick={handleDeleteSelf}
              className="ml-auto text-gray-500 hover:text-red-500 focus:outline-none p-1"
              aria-label="Delete note"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          </div>

          {/* Note text */}
          <p className="text-white mt-1 mb-2">{note.text}</p>

          {/* Action buttons */}
          <div className="flex justify-between items-center max-w-xs action-icons text-sm">
            {/* Reply Action */}
            <div className="flex items-center group cursor-pointer" onClick={toggleReplyInput}>
              <i className="far fa-comment mr-2 group-hover:text-blue-400"></i>
              <span className="group-hover:text-blue-400">{replyCount > 0 ? replyCount : ''}</span>
            </div>
            {/* Other actions like Retweet, Like, Share can be added here */}
          </div>

           {/* Reply Input Box (conditional) */}
           {showReplyInput && (
             <div className="mt-3 flex">
                <div className="avatar avatar-sm mr-3">
                    <i className="fas fa-user"></i>
                </div>
                <div className="flex-grow">
                <textarea
                    value={replyText}
                    onChange={handleReplyInputChange}
                    className="w-full p-2 rounded-lg resize-none border border-gray-700 bg-transparent note-input-area focus:outline-none text-white text-sm"
                    rows="2"
                    placeholder="Tweet your reply"
                    maxLength={maxLength + 10}
                />
                <div className="flex justify-between items-center mt-2">
                    <div className={`text-xs ${replyCountColor}`}>
                    {replyLength} / {maxLength}
                    </div>
                    <button
                    onClick={handlePostReply}
                    className="btn-tweet py-1 px-3 rounded-full text-sm"
                    disabled={!replyText.trim() || replyLength > maxLength || isPostingReply}
                    >
                    {isPostingReply ? <i className="fas fa-circle-notch fa-spin text-xs"></i> : 'Reply'}
                    </button>
                </div>
                </div>
            </div>
           )}


          {/* Toggle Replies Button (only if there are replies) */}
          {replyCount > 0 && (
             <button
                onClick={toggleReplies}
                className="text-sm text-gray-500 hover:text-blue-400 mt-2 flex items-center focus:outline-none"
             >
                <span className="mr-1">
                    {showReplies ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </span>
                <i className={`fas ${showReplies ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
             </button>
          )}
        </div>
      </div>

      {/* Replies Container (conditional) */}
      <div
        className={`replies-container mt-2 ml-12 pl-3 ${showReplies ? 'max-h-[1000px]' : 'max-h-0'}`} // Adjust max-height as needed
      >
        {isLoadingReplies && (
            <div className="text-center text-gray-400 py-2">Loading replies...</div>
        )}
        {!isLoadingReplies && replies.map(reply => (
          <ReplyCard key={reply.id} reply={reply} onDelete={handleDeleteReply} />
        ))}
      </div>
    </div>
  );
}
