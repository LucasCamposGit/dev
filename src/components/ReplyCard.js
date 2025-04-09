// app/components/ReplyCard.js
'use client';

import React from 'react';
import { formatDate } from '@/lib/utils'; // Assuming formatDate is moved to a utils file

export default function ReplyCard({ reply, onDelete }) {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this reply?')) {
      await onDelete(reply.id);
    }
  };

  return (
    <div className="mt-3 pb-3 border-b border-gray-700 last:border-b-0">
      <div className="flex">
        {/* Avatar for reply */}
        <div className="avatar avatar-sm mr-3"> {/* Smaller avatar */}
          <i className="fas fa-user"></i>
        </div>

        {/* Reply content container */}
        <div className="flex-grow">
          {/* Header with username and time */}
          <div className="flex items-center">
            <span className="font-bold mr-1 text-sm">User</span>
            <span className="text-gray-500 text-xs mr-1">@user</span>
            <span className="text-gray-500 mx-1 text-xs">·</span>
            <span className="text-gray-500 text-xs">
              {formatDate(reply.created_at)}
            </span>

            {/* Delete button for reply */}
            <button
              onClick={handleDelete}
              className="ml-auto text-gray-500 hover:text-red-500 focus:outline-none p-1" // Added padding
              aria-label="Delete reply"
            >
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
          </div>

          {/* Reply text */}
          <p className="text-white text-sm mt-1">{reply.text}</p>

          {/* Action buttons (optional for replies, kept simple) */}
          {/* <div className="flex space-x-8 mt-1 action-icons text-xs">
             Add reply actions if needed
          </div> */}
        </div>
      </div>
    </div>
  );
}
