// app/api/notes/[id]/replies/route.js
import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

/**
 * GET handler to fetch replies for a specific note ID.
 */
export async function GET(request, { params }) {
  const { id } = params; // Get parent note id from route parameters

  if (!id) {
    return NextResponse.json({ error: 'Parent Note ID is required' }, { status: 400 });
  }

  try {
    const db = await openDb();
    // Fetch replies for the given parent_id
    const replies = await db.all('SELECT * FROM notes WHERE parent_id = ? ORDER BY created_at ASC', [id]);
    // No need to close db if connection is cached

    return NextResponse.json(replies);
  } catch (error) {
    console.error(`API GET /api/notes/${id}/replies Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch replies', details: error.message }, { status: 500 });
  }
}

// POST for replies is handled by the main /api/notes route by passing parent_id
